import type { ChargeRequest, ChargeResult, PaymentProvider, RefundRequest } from "./PaymentService";

// Simulates a real gateway's latency and success shape so the booking UI is
// already built for asynchronous, occasionally-failing payments — nothing
// about the UI changes when this is replaced by a CliQ/card driver.
export class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock" as const;

  async charge(request: ChargeRequest): Promise<ChargeResult> {
    await delay(900);
    return {
      success: true,
      providerRef: `mock_${Date.now()}_${request.rentalId.slice(0, 8)}`,
      status: "paid",
    };
  }

  async refund(request: RefundRequest): Promise<ChargeResult> {
    await delay(600);
    return {
      success: true,
      providerRef: `mock_refund_${Date.now()}`,
      status: "paid",
    };
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
