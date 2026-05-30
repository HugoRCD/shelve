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

  const showFetchSpinner = !isQuiet() && !isJson()
  if (showFetchSpinner) s.start('Fetching ESLint config')

  let text: string
  try {
    const response = await fetch(templates.eslint)
    if (!response.ok) {
      throw new Error(`Failed to fetch ESLint config: ${response.status} ${response.statusText}`)
    }
    text = await response.text()
  } catch (err) {
    if (showFetchSpinner) s.stop('Fetching ESLint config')
    const message = err instanceof Error ? err.message : 'Failed to fetch ESLint config'
    cliCancel(message)
  } finally {
    if (showFetchSpinner) s.stop('Fetching ESLint config')
  }

  FileService.write(path, text)

  if (!isQuiet() && !isJson()) {
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
}
