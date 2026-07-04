import { DataRoomModel } from "../../models/data-room.model.js";
import { ListingModel } from "../../models/listing.model.js";
import { storageProvider } from "../../lib/providers/storage-provider.js";
import { NotFoundError, ForbiddenError } from "../../lib/errors.js";
import { AuditLogModel } from "../../models/audit-log.model.js";
import { chatService } from "../chat/chat.service.js";

interface AccessContext {
  userId: string;
  isAdmin: boolean;
  isAuditor: boolean;
}

/** Only the listing owner and staff (admin/auditor) may manage (write) a data room. */
async function assertCanWrite(listingId: string, ctx: AccessContext) {
  const listing = await ListingModel.findById(listingId).exec();
  if (!listing) throw new NotFoundError("Annonce introuvable");
  const isOwner = listing.sellerId.toString() === ctx.userId;
  if (!isOwner && !ctx.isAdmin && !ctx.isAuditor) {
    throw new ForbiddenError("Accès à la data room réservé au vendeur et à l'équipe MUZZUP");
  }
  return listing;
}

/** Read access additionally opens up to buyers who have signed the deal's NDA. */
async function assertCanRead(listingId: string, ctx: AccessContext) {
  const listing = await ListingModel.findById(listingId).exec();
  if (!listing) throw new NotFoundError("Annonce introuvable");
  const isOwner = listing.sellerId.toString() === ctx.userId;
  if (isOwner || ctx.isAdmin || ctx.isAuditor) return listing;
  if (await chatService.hasSignedNda(listingId, ctx.userId)) return listing;
  throw new ForbiddenError(
    "Accès à la data room réservé au vendeur, à l'équipe MUZZUP, ou à un acheteur ayant signé le NDA",
  );
}

export const dataRoomService = {
  async getOrCreate(listingId: string, ctx: AccessContext) {
    await assertCanRead(listingId, ctx);
    let room = await DataRoomModel.findOne({ listingId }).exec();
    room ??= await DataRoomModel.create({ listingId, documents: [] });
    return room;
  },

  async requestUpload(listingId: string, ctx: AccessContext, fileName: string, contentType: string) {
    await assertCanWrite(listingId, ctx);
    const key = `data-rooms/${listingId}/${Date.now()}-${fileName}`;
    const { uploadUrl } = await storageProvider.getUploadUrl(key, contentType);
    return { uploadUrl, key };
  },

  async registerDocument(
    listingId: string,
    ctx: AccessContext,
    fileName: string,
    storageKey: string,
    contentType: string,
  ) {
    await assertCanWrite(listingId, ctx);
    let room = await DataRoomModel.findOne({ listingId }).exec();
    room ??= await DataRoomModel.create({ listingId, documents: [] });
    room.documents.push({
      fileName,
      storageKey,
      contentType,
      uploadedBy: ctx.userId,
      watermarked: false,
      accessLog: [],
    } as unknown as (typeof room.documents)[number]);
    await room.save();
    return room;
  },

  async getDownloadUrl(listingId: string, documentId: string, ctx: AccessContext) {
    await assertCanRead(listingId, ctx);
    const room = await DataRoomModel.findOne({ listingId }).exec();
    const doc = room?.documents.find((d) => d._id?.toString() === documentId);
    if (!room || !doc) throw new NotFoundError("Document introuvable");

    doc.accessLog.push({
      userId: ctx.userId,
      accessedAt: new Date(),
    } as unknown as (typeof doc.accessLog)[number]);
    await room.save();

    await AuditLogModel.create({
      actorId: ctx.userId,
      action: "data_room.document_accessed",
      targetType: "DataRoomDocument",
      targetId: doc._id,
      metadata: { listingId, fileName: doc.fileName },
    });

    return storageProvider.getDownloadUrl(doc.storageKey);
  },
};
