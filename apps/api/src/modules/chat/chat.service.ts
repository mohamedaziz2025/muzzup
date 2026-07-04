import { ConversationModel, type ConversationDocument } from "../../models/conversation.model.js";
import { MessageModel } from "../../models/message.model.js";
import { RevealRequestModel } from "../../models/reveal-request.model.js";
import { NdaModel } from "../../models/nda.model.js";
import { ListingModel } from "../../models/listing.model.js";
import { UserModel } from "../../models/user.model.js";
import { AuditLogModel } from "../../models/audit-log.model.js";
import { detectLeakedCoordinates } from "./coordinate-detector.js";
import { eSignProvider } from "../../lib/providers/esign-provider.js";
import { notificationsService } from "../notifications/notifications.service.js";
import { getIoInstance } from "../../sockets/io-instance.js";
import { BadRequestError, ForbiddenError, NotFoundError, ConflictError } from "../../lib/errors.js";
import { REVEAL_PHASES, type RevealPhase } from "@muzzap/shared";

function emitToConversation(conversationId: string, event: string, payload: unknown) {
  getIoInstance()?.of("/chat").to(`conversation:${conversationId}`).emit(event, payload);
}

export const chatService = {
  async getOrCreateConversation(listingId: string, buyerId: string) {
    const listing = await ListingModel.findById(listingId).exec();
    if (!listing) throw new NotFoundError("Annonce introuvable");
    const sellerId = listing.sellerId.toString();
    if (sellerId === buyerId) {
      throw new BadRequestError("Vous ne pouvez pas démarrer une conversation avec vous-même");
    }

    let conversation = await ConversationModel.findOne({
      listingId,
      participantIds: { $all: [buyerId, sellerId] },
    }).exec();

    conversation ??= await ConversationModel.create({
      listingId,
      participantIds: [buyerId, sellerId],
    });

    return conversation;
  },

  /** Provider directory reuses the same anonymous chat, keyed on the provider's user account instead of a listing. */
  async getOrCreateProviderConversation(providerUserId: string, memberId: string) {
    if (providerUserId === memberId) {
      throw new BadRequestError("Vous ne pouvez pas démarrer une conversation avec vous-même");
    }

    let conversation = await ConversationModel.findOne({
      listingId: null,
      participantIds: { $all: [memberId, providerUserId] },
    }).exec();

    conversation ??= await ConversationModel.create({
      listingId: null,
      participantIds: [memberId, providerUserId],
    });

    return conversation;
  },

  async listForUser(userId: string) {
    const conversations = await ConversationModel.find({ participantIds: userId })
      .sort({ updatedAt: -1 })
      .populate("listingId", "title type")
      .exec();

    const pendingRequests = await RevealRequestModel.find({
      conversationId: { $in: conversations.map((c) => c._id) },
      status: "pending",
    }).exec();
    const pendingByConversation = new Map(
      pendingRequests.map((r) => [r.conversationId.toString(), r]),
    );

    return conversations.map((conversation) => {
      const pending = pendingByConversation.get(conversation._id.toString());
      return {
        ...conversation.toObject(),
        pendingRevealRequest: pending
          ? {
              id: pending._id.toString(),
              targetPhase: pending.targetPhase,
              requestedBy: pending.requestedBy.toString(),
            }
          : null,
      };
    });
  },

  async assertParticipant(conversationId: string, userId: string): Promise<ConversationDocument> {
    const conversation = await ConversationModel.findById(conversationId).exec();
    if (!conversation) throw new NotFoundError("Conversation introuvable");
    if (!conversation.participantIds.some((id) => id.toString() === userId)) {
      throw new ForbiddenError("Vous ne participez pas à cette conversation");
    }
    return conversation;
  },

  async getMessages(conversationId: string, userId: string) {
    await this.assertParticipant(conversationId, userId);
    const messages = await MessageModel.find({ conversationId }).sort({ createdAt: 1 }).exec();
    const { modifiedCount } = await MessageModel.updateMany(
      { conversationId, senderId: { $ne: userId }, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } },
    );
    if (modifiedCount > 0) {
      emitToConversation(conversationId, "message:read", { conversationId, readerId: userId });
    }
    return messages;
  },

  async sendMessage(conversationId: string, senderId: string, body: string) {
    const conversation = await this.assertParticipant(conversationId, senderId);
    if (conversation.adminBlocked) {
      throw new ForbiddenError("Cette conversation a été bloquée par la modération");
    }
    const detection = detectLeakedCoordinates(body);

    const message = await MessageModel.create({
      conversationId,
      senderId,
      body,
      flagged: detection.flagged,
      flagReason: detection.reason,
      readBy: [senderId],
    });

    conversation.lastMessageAt = new Date();
    conversation.lastMessagePreview = detection.flagged ? "Message signalé" : body.slice(0, 140);
    conversation.lastMessageSenderId = senderId as unknown as NonNullable<
      typeof conversation.lastMessageSenderId
    >;
    if (detection.flagged) conversation.flaggedCount += 1;
    await conversation.save();

    if (detection.flagged) {
      await AuditLogModel.create({
        actorId: senderId,
        action: "chat.coordinates_flagged",
        targetType: "Message",
        targetId: message._id,
        metadata: { conversationId, reason: detection.reason },
      });
    }

    emitToConversation(conversationId, "message:new", {
      id: message._id.toString(),
      conversationId,
      senderId,
      body,
      flagged: detection.flagged,
      readBy: [senderId],
      createdAt: message.createdAt,
    });

    return message;
  },

  async proposeReveal(conversationId: string, requestedBy: string, targetPhase: RevealPhase) {
    const conversation = await this.assertParticipant(conversationId, requestedBy);
    const currentIndex = REVEAL_PHASES.indexOf(conversation.revealPhase as RevealPhase);
    const targetIndex = REVEAL_PHASES.indexOf(targetPhase);
    if (targetIndex !== currentIndex + 1) {
      throw new BadRequestError("La révélation doit se faire phase par phase");
    }

    const existing = await RevealRequestModel.findOne({
      conversationId,
      status: "pending",
    }).exec();
    if (existing) throw new ConflictError("Une demande de révélation est déjà en attente");

    const request = await RevealRequestModel.create({ conversationId, requestedBy, targetPhase });

    const otherUserId = conversation.participantIds.find((id) => id.toString() !== requestedBy);
    if (otherUserId) {
      await notificationsService.create(
        otherUserId.toString(),
        "system",
        "Demande de révélation d'identité",
        "Votre interlocuteur souhaite passer à l'étape suivante de révélation d'identité.",
        `/messages/${conversationId}`,
      );
    }

    emitToConversation(conversationId, "reveal:requested", { requestId: request._id.toString(), targetPhase });
    return request;
  },

  async respondReveal(requestId: string, userId: string, accept: boolean) {
    const request = await RevealRequestModel.findById(requestId).exec();
    if (!request) throw new NotFoundError("Demande introuvable");
    if (request.status !== "pending") throw new ConflictError("Cette demande a déjà été traitée");

    const conversation = await this.assertParticipant(request.conversationId.toString(), userId);
    if (request.requestedBy.toString() === userId) {
      throw new ForbiddenError("Vous ne pouvez pas répondre à votre propre demande");
    }

    request.status = accept ? "accepted" : "declined";
    request.respondedBy = userId as unknown as NonNullable<typeof request.respondedBy>;
    request.respondedAt = new Date();
    await request.save();

    if (accept) {
      conversation.revealPhase = request.targetPhase;
      conversation.revealHistory.push({
        phase: request.targetPhase,
        unlockedAt: new Date(),
      } as unknown as (typeof conversation.revealHistory)[number]);
      await conversation.save();
    }

    emitToConversation(request.conversationId.toString(), "reveal:resolved", {
      requestId: request._id.toString(),
      accepted: accept,
      phase: conversation.revealPhase,
    });

    return { request, conversation };
  },

  async requestNda(conversationId: string, requestedBy: string) {
    const conversation = await this.assertParticipant(conversationId, requestedBy);
    const existing = await NdaModel.findOne({ conversationId, status: { $ne: "declined" } }).exec();
    if (existing) return existing;

    const participants = await UserModel.find({ _id: { $in: conversation.participantIds } }).exec();

    const { requestId } = await eSignProvider.createSignatureRequest({
      documentTitle: "Accord de confidentialité MUZZUP",
      signerEmails: participants.map((p) => p.email),
    });

    const nda = await NdaModel.create({
      conversationId,
      listingId: conversation.listingId,
      requestedBy,
      eSignRequestId: requestId,
      status: "pending",
    });

    conversation.ndaId = nda._id as unknown as NonNullable<typeof conversation.ndaId>;
    await conversation.save();

    emitToConversation(conversationId, "nda:requested", { ndaId: nda._id.toString() });
    return nda;
  },

  /** Dev-only stand-in for the Yousign completion webhook until that integration is wired in. */
  async markNdaSigned(ndaId: string) {
    const nda = await NdaModel.findById(ndaId).exec();
    if (!nda) throw new NotFoundError("NDA introuvable");
    nda.status = "signed";
    nda.signedAt = new Date();
    await nda.save();
    emitToConversation(nda.conversationId.toString(), "nda:signed", { ndaId });
    return nda;
  },

  /** Admin-only read path: bypasses the participant membership check for moderation purposes. */
  async getMessagesForAdmin(conversationId: string) {
    const conversation = await ConversationModel.findById(conversationId).exec();
    if (!conversation) throw new NotFoundError("Conversation introuvable");
    return MessageModel.find({ conversationId }).sort({ createdAt: 1 }).exec();
  },

  async hasSignedNda(listingId: string, userId: string): Promise<boolean> {
    const conversations = await ConversationModel.find({
      listingId,
      participantIds: userId,
    })
      .select("_id")
      .exec();
    if (conversations.length === 0) return false;
    const nda = await NdaModel.findOne({
      conversationId: { $in: conversations.map((c) => c._id) },
      status: "signed",
    }).exec();
    return !!nda;
  },
};
