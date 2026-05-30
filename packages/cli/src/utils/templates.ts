import { addDevDependency } from 'nypm'
import { note, spinner } from '@clack/prompts'
import { FileService } from '../services'
import { askBoolean } from './prompt'
import { cliCancel, cliIntro } from './output'
import { isJson, isNonInteractive, isQuiet, shouldSkipConfirm } from './cli-context'

const s = spinner()

const templates = {
  eslint: 'https://raw.githubusercontent.com/HugoRCD/templates/main/eslint.config.js',
}

export async function getEslintConfig(): Promise<string> {
  const path = 'eslint.config.js'
  cliIntro('Generate ESLint config')

  if (!isQuiet() && !isJson()) {
    s.start('Fetching ESLint config')
  }

  try {
    const response = await fetch(templates.eslint)
    if (!response.ok) {
      throw new Error(`Failed to fetch ESLint config: ${response.status} ${response.statusText}`)
    }
    const text = await response.text()

    FileService.write(path, text)

    if (!isQuiet() && !isJson()) {
      s.stop('Fetching ESLint config')
      note('ESLint config has been generated', 'ESLint config')
    }

    const shouldInstall = isNonInteractive()
      ? false
      : shouldSkipConfirm()
        ? true
        : await askBoolean('Do you want to install ESLint and @hrcd/eslint-config?')

    if (shouldInstall) {
      if (!isQuiet() && !isJson()) s.start('Installing eslint and @hrcd/eslint-config')
      await addDevDependency('eslint', { silent: true })
      await addDevDependency('@hrcd/eslint-config', { silent: true })
      if (!isQuiet() && !isJson()) s.stop('Installing ESLint and @hrcd/eslint-config')
    }

    return path
  } catch {
    cliCancel('Failed to fetch ESLint config')
  }
}
