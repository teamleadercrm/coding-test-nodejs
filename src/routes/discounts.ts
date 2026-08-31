import type { FastifyInstance } from 'fastify';

// The HTTP caller. One of the two ways into the discount service.
//
// The request shape is the example orders in `fixtures/orders/`. The response
// shape is the contract `verification/` checks: a `discountTotal` and a list of
// `discounts`, each with an `amount` and a `reason`. What those reasons say,
// and anything else you attach to them, is yours.
//
// So is the shape of the values. The `'0.00'` below is a placeholder that keeps
// this endpoint answering on-contract before you have written anything — not a
// decimal-string recommendation. Represent money however you can defend.

const orderSchema = {
  type: 'object',
  required: ['id', 'customer-id', 'items'],
  properties: {
    id: { type: 'string' },
    'customer-id': { type: 'string' },
    total: { type: 'string' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        required: ['product-id', 'quantity'],
        properties: {
          'product-id': { type: 'string' },
          quantity: { type: 'string' },
          'unit-price': { type: 'string' },
          total: { type: 'string' },
        },
      },
    },
  },
} as const;

export default async function routes(fastify: FastifyInstance) {
  fastify.post('/discounts', { schema: { body: orderSchema } }, async () => {
    // TODO(candidate): calculate the discounts for this order.
    return { discountTotal: '0.00', discounts: [] };
  });
}
