import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const cliDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@utils': path.resolve(cliDir, '../utils'),
      '@types': path.resolve(cliDir, '../types'),
    },
  },
})
