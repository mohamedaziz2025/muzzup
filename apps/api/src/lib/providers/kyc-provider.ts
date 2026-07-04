import { logger } from "../../config/logger.js";

/** Abstracts the KYC vendor (SumSub in production) behind a swappable interface. */
export interface KycProvider {
  createVerificationSession(userId: string, email: string): Promise<{ sessionId: string; url: string }>;
}

/** Dev stand-in: logs the request; an admin manually flips kycStatus until SumSub is wired in. */
export class ConsoleKycProvider implements KycProvider {
  async createVerificationSession(userId: string, email: string) {
    const sessionId = `dev-${Date.now()}`;
    logger.info({ userId, email, sessionId }, "[KycProvider] Session de vérification simulée");
    return { sessionId, url: `https://kyc.muzzap.invalid/session/${sessionId}` };
  }
}

export const kycProvider: KycProvider = new ConsoleKycProvider();
