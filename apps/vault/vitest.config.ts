import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const resolve = (p: string) => fileURLToPath(new URL(p, import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@types': resolve('../../packages/types'),
    },
  },
  esbuild: {
    tsconfigRaw: '{}',
  },
  test: {
    projects: [
      {
        resolve: {
          alias: {
            '@types': resolve('../../packages/types'),
          },
        },
        esbuild: {
          tsconfigRaw: '{}',
        },
        test: {
          name: 'unit',
          include: ['test/unit/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        esbuild: {
          tsconfigRaw: '{}',
        },
        test: {
          name: 'e2e',
          include: ['test/e2e/**/*.test.ts'],
          environment: 'node',
        },
      },
    ],
  },
})
