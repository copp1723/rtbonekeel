import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'src/**/*.{test,spec}.ts',
      'tests/unit/**/*.{test,spec}.ts',
      'tests/integration/**/*.{test,spec}.ts',
      'tests/e2e/**/*.{test,spec}.ts'
    ],
    exclude: [
      '**/node_modules/**',
      '**/node_modules_old/**',
      '**/dist/**',
      '**/frontend/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        '**/node_modules/**',
        '**/node_modules_old/**',
        '**/dist/**',
        '**/frontend/**',
        '**/*.d.ts',
        '**/types/**'
      ],
      reportsDirectory: './coverage',
      // Set coverage thresholds
      thresholds: {
        statements: 70,
        branches: 60,
        functions: 70,
        lines: 70
      }
    },
    setupFiles: ['./vitest.setup.ts'],
    testTimeout: 30000, // 30 seconds timeout for tests
    hookTimeout: 30000, // 30 seconds timeout for hooks
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
