import { describe, it, expect } from 'vitest';

import { tools } from '@/tools/index.js';
import { callsFor } from './_badCalls.js';

// The tool half of the floor, and the same rule as the HTTP half: it checks
// shape, never content. It never asserts what your answers say — only that
// there is one, and that it came back as a value rather than as a thrown
// exception the caller has no way to catch.
//
// `declares at least one argument` fails on a fresh clone. That one is a task,
// not a break: a tool with no arguments cannot be told which order to price.

describe.each(tools.map((tool) => [tool.name, tool] as const))('%s', (_name, tool) => {
  it('declares at least one argument (red on a fresh clone — this one is a task)', () => {
    expect(Object.keys(tool.inputSchema?.properties ?? {}).length).toBeGreaterThan(0);
  });

  describe.each(callsFor(tool).map((call) => [call.label, call] as const))('sent %s', (_label, call) => {
    it('answers rather than throwing', async () => {
      const result = await tool.execute(call.args);

      expect(result, 'execute must resolve to a ToolResult').toBeTypeOf('object');
      expect(result, 'execute must resolve to a ToolResult').not.toBeNull();

      if (result.success === false) {
        expect(String(result.error?.title ?? '').trim().length).toBeGreaterThan(0);
      } else {
        expect(result.success).toBe(true);
      }
    });
  });
});
