import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    // `verification/` is the published floor and ships with the repo.
    // `tests/` is yours.
    include: ['tests/**/*.test.ts', 'verification/**/*.test.ts'],
  },
});
