import { logger } from "../../config/logger.js";

export interface EmailMessage {
  to: string;
  subject: string;
  templateId: string;
  variables: Record<string, string>;
}

/** Abstracts the transactional email vendor (Brevo in production) behind a swappable interface. */
export interface EmailProvider {
  send(message: EmailMessage): Promise<void>;
}

/** Dev/test stand-in: logs the message instead of calling a real provider. Swap for a Brevo-backed implementation in Module E. */
export class ConsoleEmailProvider implements EmailProvider {
  async send(message: EmailMessage): Promise<void> {
    logger.info({ email: message }, "[EmailProvider] Envoi simulé");
  }
}

export const emailProvider: EmailProvider = new ConsoleEmailProvider();
