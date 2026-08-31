// TODO(candidate): this is where the discount service goes.
//
// The public surface of this module. Anything you put in a `_`-prefixed file
// next to this one is private to the module and cannot be imported from
// routes/ or from another module — `npm run lint` enforces that.

export interface DiscountedOrder {
  orderId: string;
  // How you represent money — a decimal string, integer minor units, a type of
  // your own — is your decision, here and on the wire. We check that these keys
  // exist, never what shape their values take.
  total: unknown;
  discountTotal: unknown;
  // Whatever shape you choose, the reasons for each discount must be legible.
  discounts: unknown[];
}
