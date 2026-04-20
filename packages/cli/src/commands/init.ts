import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineCommand } from 'citty'
import { intro, outro, log } from '@clack/prompts'
import { writeAgentIgnoreFiles } from '../utils'

const GITIGNORE_BLOCK = [
  '# shelve-managed-block',
  '.env',
  '.env.*',
  '!.env.template',
  '!.env.example',
  '.shelve/',
  '# end shelve-managed-block',
] as const

export default defineCommand({
  meta: {
    name: 'init',
    description: 'Add agent-aware ignore files (.cursorignore, .aiderignore, …) and update .gitignore so secrets stay out of model contexts.',
  },
  args: {
    cwd: {
      type: 'string',
      description: 'directory to initialize (defaults to current working directory)',
      required: false,
    },
  },
  run({ args }) {
    intro('Securing this workspace from AI agents')

    const cwd = args.cwd || process.cwd()
    const { writtenFiles, skippedFiles } = writeAgentIgnoreFiles(cwd)

    if (writtenFiles.length > 0) {
      log.success(`Updated: ${writtenFiles.join(', ')}`)
    }
    if (skippedFiles.length > 0) {
      log.info(`Already up to date: ${skippedFiles.join(', ')}`)
    }

    const gitignorePath = join(cwd, '.gitignore')
    const existing = existsSync(gitignorePath) ? readFileSync(gitignorePath, 'utf-8') : ''
    if (!existing.includes('# shelve-managed-block')) {
      const sep = existing.length === 0 ? '' : existing.endsWith('\n') ? '' : '\n'
      writeFileSync(gitignorePath, `${existing + sep + GITIGNORE_BLOCK.join('\n') }\n`, 'utf-8')
      log.success('Updated: .gitignore')
    } else {
      log.info('.gitignore already contains a shelve-managed block')
    }

    outro('Use `shelve run -- <cmd>` instead of `shelve pull` whenever possible.')
  },
})
