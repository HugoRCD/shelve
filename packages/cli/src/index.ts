#!/usr/bin/env node

import { defineCommand, runMain } from 'citty'
import consola from 'consola'
import { colors } from 'consola/utils'
import { readPackageJSON } from 'pkg-types'

const pkg = await readPackageJSON()

const main = defineCommand({
  meta: {
    name: 'nuxthub',
    description: 'NuxtHub CLI',
    version: pkg.version,
  },
  setup({ args, cmd }) {
    if (args._.length) {
      consola.log(colors.gray(`${cmd.meta.description}`))
    }
  },
  subCommands: {
  },
})

runMain(main).then((_) => {
  process.exit(0)
}).catch((err) => {
  consola.error(err)
  process.exit(1)
})
