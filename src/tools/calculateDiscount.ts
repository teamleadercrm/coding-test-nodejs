import type { ToolDescriptor, ToolResult } from './_toolDescriptor.js';

// The tool caller. The other of the two ways into the discount service.
//
// There is no new logic to write here: this calls the same service the endpoint
// calls. What it does need is writing — see "Who is calling" in INSTRUCTIONS.md.

export const calculateDiscountToolDescriptor: ToolDescriptor = {
  name: 'calculateDiscount',
  category: 'background',

  // TODO(candidate): what does the caller need to know to use this correctly?
  description: '',

  // TODO(candidate): what arguments does this take?
  //
  // Left empty on purpose — this is a decision, not a blank to fill in. Note
  // that the HTTP body in `fixtures/orders/` carries a `unit-price` and a
  // `total` on every line, and the caller assembling these arguments has no
  // way of knowing either. Whether it should be supplying them is worth a
  // thought; `fixtures/products.json` is on this side of the boundary.
  inputSchema: {
    type: 'object',
    properties: {},
  },

  // TODO(candidate): calculate the discounts for this order.
  //
  // The `'0.00'` below is a placeholder so the project runs before you have
  // written anything — not a decimal-string recommendation. Money is yours to
  // represent as you can defend, here and on the wire.
  execute: async (): Promise<ToolResult> => {
    return { success: true, discountTotal: '0.00', discounts: [] };
  },
};
