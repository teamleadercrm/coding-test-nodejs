import { readdir, readFile, appendFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import Fastify from 'fastify';

import { app } from '@/app.js';
import { tools } from '@/tools/index.js';
import { callsFor } from './_badCalls.js';

// Prints what the service returns — for every example order, and for every way
// a caller can get a tool call wrong. It asserts nothing and can neither pass
// nor fail: it is a readable record of behaviour, for you while you build and
// for us to read afterwards.

const ordersDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', 'orders');

type Discount = { amount?: unknown; reason?: unknown };

function table(discounts: Discount[]) {
  if (discounts.length === 0) {
    return '_No discounts applied._';
  }

  const rows = discounts.map((d) => `| ${String(d.reason ?? '—')} | ${String(d.amount ?? '—')} |`);

  return ['| reason | amount |', '| --- | --- |', ...rows].join('\n');
}

const fastify = Fastify();

fastify.register(app);
await fastify.ready();

const files = (await readdir(ordersDir)).filter((f) => f.endsWith('.json')).sort();
const sections: string[] = ['# Discount report', ''];

for (const file of files) {
  const raw = await readFile(path.join(ordersDir, file), 'utf8');
  const res = await fastify.inject({ method: 'POST', url: '/discounts', payload: JSON.parse(raw) });

  sections.push(`## ${file}`, '');

  if (res.statusCode !== 200) {
    sections.push(`**HTTP ${res.statusCode}**`, '', '```', res.body.slice(0, 2000), '```', '');
    continue;
  }

  let body: { discountTotal?: unknown; discounts?: Discount[] };

  try {
    body = res.json();
  } catch {
    sections.push('**Response was not JSON**', '', '```', res.body.slice(0, 2000), '```', '');
    continue;
  }

  sections.push(
    table(Array.isArray(body.discounts) ? body.discounts : []),
    '',
    `**discountTotal: ${String(body.discountTotal ?? '—')}**`,
    '',
    '<details><summary>raw response</summary>',
    '',
    '```json',
    JSON.stringify(body, null, 2),
    '```',
    '',
    '</details>',
    '',
  );
}

await fastify.close();

// --- the caller -----------------------------------------------------------
//
// Your tool, invoked the way a model does: badly. Nothing here is asserted.
// Read what comes back and ask whether a caller could tell what to do next.

sections.push('# The caller', '');

for (const tool of tools) {
  sections.push(
    `## \`${tool.name}\``,
    '',
    'Everything the caller can see — it cannot read your repo:',
    '',
    '```json',
    JSON.stringify(
      {
        name: tool.name,
        category: tool.category,
        description: tool.description,
        inputSchema: tool.inputSchema,
      },
      null,
      2,
    ),
    '```',
    '',
  );

  for (const call of callsFor(tool)) {
    sections.push(`### It sends ${call.label}`, '', `_${call.why}_`, '', '```json', JSON.stringify(call.args, null, 2), '```', '');

    let answer: string;

    try {
      answer = JSON.stringify(await tool.execute(call.args), null, 2) ?? 'undefined';
    } catch (error) {
      answer = `THREW — the caller cannot catch this\n${error instanceof Error ? `${error.name}: ${error.message}` : String(error)}`;
    }

    sections.push('It gets back:', '', '```json', answer, '```', '');
  }
}

const markdown = sections.join('\n');

console.log(markdown);

if (process.env.GITHUB_STEP_SUMMARY) {
  await appendFile(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`);
}
