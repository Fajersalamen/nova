import { MockPaymentProvider } from "./MockPaymentProvider";
import type { PaymentProvider } from "./PaymentService";

// Single place to swap providers. Real integration later:
//   export const paymentProvider: PaymentProvider = new CliqPaymentProvider();
export const paymentProvider: PaymentProvider = new MockPaymentProvider();

export * from "./PaymentService";
