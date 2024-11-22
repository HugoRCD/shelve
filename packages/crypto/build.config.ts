import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  rollup: {
    esbuild: {
      target: 'esnext',
    },
    emitCJS: false,
    cjsBridge: true,
  },
})
