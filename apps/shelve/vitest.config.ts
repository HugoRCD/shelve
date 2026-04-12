import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const resolve = (p: string) => fileURLToPath(new URL(p, import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@types': resolve('../../packages/types'),
      '@utils': resolve('../../packages/utils'),
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
            '@utils': resolve('../../packages/utils'),
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
          setupFiles: ['test/e2e/setup.ts'],
          env: {
            NUXT_TEST_SEED: '1',
            SKIP_ENV_VALIDATION: '1',
          },
        },
      },
    ],
  },
})
