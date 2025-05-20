import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      statements: 60,
      branches: 50,
      functions: 60,
      lines: 60
    }
  }
});
