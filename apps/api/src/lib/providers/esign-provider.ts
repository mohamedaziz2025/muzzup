import { logger } from "../../config/logger.js";

export interface SignatureRequestInput {
  documentTitle: string;
  signerEmails: string[];
}

/** Abstracts the e-signature vendor (Yousign in production) behind a swappable interface. */
export interface ESignProvider {
  createSignatureRequest(input: SignatureRequestInput): Promise<{ requestId: string }>;
}

/** Dev stand-in: logs the request; a manual "mark signed" endpoint drives the flow until Yousign is wired in. */
export class ConsoleESignProvider implements ESignProvider {
  async createSignatureRequest(input: SignatureRequestInput): Promise<{ requestId: string }> {
    const requestId = `dev-${Date.now()}`;
    logger.info({ input, requestId }, "[ESignProvider] Demande de signature simulée");
    return { requestId };
  }
}

export const eSignProvider: ESignProvider = new ConsoleESignProvider();
