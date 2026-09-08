// Payment abstraction. The rest of the app (booking flow, refunds, deposit
// release) is written against this interface only — it never imports a
// concrete provider directly. Swapping MockPaymentProvider for a real CliQ or
// card driver later is a one-line change in `index.ts`, with zero UI changes.

export type ChargeRequest = {
  rentalId: string;
  amount: number;
  currency: "JOD";
  description: string;
};

export type ChargeResult = {
  success: boolean;
  providerRef: string;
  status: "paid" | "failed" | "pending";
  failureReason?: string;
};

export type RefundRequest = {
  rentalId: string;
  amount: number;
  reason: string;
};

export interface PaymentProvider {
  readonly name: "mock" | "cliq" | "card" | "wallet";
  charge(request: ChargeRequest): Promise<ChargeResult>;
  refund(request: RefundRequest): Promise<ChargeResult>;
}
