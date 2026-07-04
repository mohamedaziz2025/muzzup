/**
 * Abstraction for a regulated escrow provider (Lemonway/MangoPay). Not implemented in Phase 1:
 * per product principle, Muzzap's internal team operates closing manually and no funds move
 * between buyer and seller through the platform yet. This interface exists so a Phase 2
 * implementation can be plugged in without reshaping the deal-pipeline domain code.
 */
export interface PaymentEscrowProvider {
  createEscrowAccount(dealId: string): Promise<{ escrowAccountId: string }>;
  depositFunds(escrowAccountId: string, amountCents: number): Promise<{ transactionId: string }>;
  releaseFunds(escrowAccountId: string, toBeneficiaryId: string): Promise<{ transactionId: string }>;
  refund(escrowAccountId: string): Promise<{ transactionId: string }>;
}
