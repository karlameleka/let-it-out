export const EGYPT_SHIPPING_FEE_EGP = 100;

export function computeShippingFeeEGP(country: string): number {
  return country === "Egypt" ? EGYPT_SHIPPING_FEE_EGP : 0;
}
