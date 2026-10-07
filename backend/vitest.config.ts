import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // @ts-ignore
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    root: './',
    include: ['**/*.spec.ts'],
  },
});

