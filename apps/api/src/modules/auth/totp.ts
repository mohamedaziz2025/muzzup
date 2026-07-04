import { authenticator } from "otplib";
import QRCode from "qrcode";
import { createHash, randomBytes } from "node:crypto";

authenticator.options = { window: 1 };

const ISSUER = "MUZZUP";

export function generateTotpSecret(): string {
  return authenticator.generateSecret();
}

export function buildOtpAuthUrl(email: string, secret: string): string {
  return authenticator.keyuri(email, ISSUER, secret);
}

export function generateQrCodeDataUrl(otpAuthUrl: string): Promise<string> {
  return QRCode.toDataURL(otpAuthUrl);
}

export function verifyTotpToken(token: string, secret: string): boolean {
  return authenticator.check(token, secret);
}

export function generateRecoveryCodes(count = 8): { plain: string[]; hashes: string[] } {
  const plain = Array.from({ length: count }, () => randomBytes(5).toString("hex"));
  const hashes = plain.map((code) => createHash("sha256").update(code).digest("hex"));
  return { plain, hashes };
}
