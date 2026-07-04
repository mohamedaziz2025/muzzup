import type { Request, Response } from "express";
import type {
  StartConversationInput,
  SendMessageInput,
  ProposeRevealInput,
  RespondRevealInput,
} from "@muzzap/shared";
import { chatService } from "./chat.service.js";

export const chatController = {
  async start(req: Request, res: Response) {
    const { listingId } = req.body as StartConversationInput;
    const conversation = await chatService.getOrCreateConversation(listingId, req.auth!.userId);
    res.status(200).json({ success: true, data: { conversation } });
  },

  async list(req: Request, res: Response) {
    const conversations = await chatService.listForUser(req.auth!.userId);
    res.status(200).json({ success: true, data: { conversations } });
  },

  async messages(req: Request, res: Response) {
    const messages = await chatService.getMessages(req.params.id as string, req.auth!.userId);
    res.status(200).json({ success: true, data: { messages } });
  },

  async sendMessage(req: Request, res: Response) {
    const { body } = req.body as SendMessageInput;
    const message = await chatService.sendMessage(req.params.id as string, req.auth!.userId, body);
    res.status(201).json({ success: true, data: { message } });
  },

  async proposeReveal(req: Request, res: Response) {
    const { targetPhase } = req.body as ProposeRevealInput;
    const request = await chatService.proposeReveal(req.params.id as string, req.auth!.userId, targetPhase);
    res.status(201).json({ success: true, data: { request } });
  },

  async respondReveal(req: Request, res: Response) {
    const { accept } = req.body as RespondRevealInput;
    const result = await chatService.respondReveal(req.params.requestId as string, req.auth!.userId, accept);
    res.status(200).json({ success: true, data: result });
  },

  async requestNda(req: Request, res: Response) {
    const nda = await chatService.requestNda(req.params.id as string, req.auth!.userId);
    res.status(201).json({ success: true, data: { nda } });
  },

  async markNdaSigned(req: Request, res: Response) {
    const nda = await chatService.markNdaSigned(req.params.ndaId as string);
    res.status(200).json({ success: true, data: { nda } });
  },
};
