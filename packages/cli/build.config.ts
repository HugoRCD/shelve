import * as path from 'node:path'
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  rollup: {
    inlineDependencies: true
  },
  alias: {
    '@types': path.resolve(__dirname, '../types'),
    '@utils': path.resolve(__dirname, '../utils')
  }
})
