import { defineCommand } from 'citty'
import { version, description } from '../package.json'
import { checkForUpdates } from './utils/update.ts'

export const main = defineCommand({
  meta: {
    name: 'shelve',
    version,
    description,
  },
  subCommands: {
    upgrade: () => import('./commands/upgrade').then((r) => r.default),
    u: () => import('./commands/upgrade').then((r) => r.default),
    create: () => import('./commands/create').then((r) => r.default),
    init: () => import('./commands/create').then((r) => r.default),
    i: () => import('./commands/create').then((r) => r.default),
    c: () => import('./commands/create').then((r) => r.default),
    link: () => import('./commands/link').then((r) => r.default),
    l: () => import('./commands/link').then((r) => r.default),
    unlink: () => import('./commands/unlink').then((r) => r.default),
    ul: () => import('./commands/unlink').then((r) => r.default),
    pull: () => import('./commands/pull').then((r) => r.default),
    pl: () => import('./commands/pull').then((r) => r.default),
    push: () => import('./commands/push').then((r) => r.default),
    ps: () => import('./commands/push').then((r) => r.default),
    whoami: () => import('./commands/whoami').then((r) => r.default),
    w: () => import('./commands/whoami').then((r) => r.default),
    login: () => import('./commands/login').then((r) => r.default),
    li: () => import('./commands/login').then((r) => r.default),
    logout: () => import('./commands/logout').then((r) => r.default),
    lo: () => import('./commands/logout').then((r) => r.default),
    open: () => import('./commands/open').then((r) => r.default),
    o: () => import('./commands/open').then((r) => r.default),
  },
  async setup() {
    await checkForUpdates()
  },
  cleanup() {}
}) as any
