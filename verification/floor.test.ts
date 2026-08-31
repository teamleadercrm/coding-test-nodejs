import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import Fastify, { type FastifyInstance } from 'fastify';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { app } from '@/app.js';

// The floor is a contract gate. It checks that your service answers in the shape
// we agreed, for every example order. It deliberately asserts NOTHING about the
// discounts you calculate — how you read the rules is yours to decide and yours
// to defend.
//
// It does not check the *format* of the values either. Whether money is a decimal
// string, minor units or something of your own is your decision to make, so the
// floor checks that the keys are there and leaves their shape alone.

const ordersDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', 'orders');
const orderFiles = (await readdir(ordersDir)).filter((f) => f.endsWith('.json')).sort();

let fastify: FastifyInstance;

beforeAll(async () => {
  fastify = Fastify();
  fastify.register(app);
  await fastify.ready();
});

afterAll(async () => {
  await fastify.close();
});

async function post(payload: unknown) {
  const res = await fastify.inject({
    method: 'POST',
    url: '/discounts',
    payload: payload as object,
  });

  return res;
}

describe.each(orderFiles)('%s', (file) => {
  let body: { discountTotal?: unknown; discounts?: unknown };

  beforeAll(async () => {
    const order = JSON.parse(await readFile(path.join(ordersDir, file), 'utf8'));
    const res = await post(order);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    body = res.json();
  });

  it('reports a discount total', () => {
    expect(Object.hasOwn(body, 'discountTotal')).toBe(true);
  });

  it('reports the discounts it applied as an array', () => {
    expect(Array.isArray(body.discounts)).toBe(true);
  });

  it('gives every discount an amount and a reason', () => {
    for (const discount of body.discounts as Array<Record<string, unknown>>) {
      expect(Object.hasOwn(discount, 'amount')).toBe(true);
      expect(typeof discount.reason).toBe('string');
      expect(String(discount.reason).trim().length).toBeGreaterThan(0);
    }
  });
});

describe('bad input is rejected, not crashed on', () => {
  it.each([
    ['an empty object', {}],
    ['a payload that is not an order', { nope: true }],
    ['an order with no items', { id: '9', 'customer-id': '1' }],
  ])('answers 4xx for %s', async (_label, payload) => {
    const res = await post(payload);

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.statusCode).toBeLessThan(500);
  });
});
