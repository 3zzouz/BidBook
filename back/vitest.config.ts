import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/dto/**',
        '**/entities/**',
        '**/enums/**',
        'test/',
        'coverage/',
      ],
    },
    include: ['src/**/*.test.ts', 'src/tests/**/*.test.ts'],
    exclude: ['**/*.spec.ts', '**/node_modules/**', '**/dist/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      src: path.resolve(__dirname, './src'),
    },
  },
});
