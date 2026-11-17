import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      include: ['src/domain/**/*.js'],
      thresholds: { lines: 70, functions: 70, branches: 70, statements: 70 }
    }
  }
});
