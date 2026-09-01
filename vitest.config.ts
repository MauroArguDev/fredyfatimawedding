import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/testSetup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}', 'api/**/*.ts'],
      exclude: [
        '**/*.test.{ts,tsx}',
        'src/testSetup.ts',
        'src/main.tsx',
        'api/_lib/firestore.ts',
        'src/components/admin/primitives/**',
      ],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 60,
        statements: 60,
        'api/**': { lines: 90, functions: 90, branches: 90, statements: 90 },
        'src/schemas/**': { lines: 90, functions: 90, branches: 90, statements: 90 },
      },
    },
  },
});
