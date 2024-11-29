import { addDevDependency } from 'nypm'
import { spinner, note, intro } from '@clack/prompts'
import { FileService } from '../services'
import { askBoolean } from './prompt'
import { handleCancel } from "./error-handler";

const s = spinner()

const templates = {
  eslint: 'https://raw.githubusercontent.com/HugoRCD/templates/main/eslint.config.js'
}

export async function getEslintConfig(): Promise<void> {
  intro('Generate ESLint config')

  s.start('Fetching ESLint config')

  try {
    const response = await fetch(templates.eslint)
    const text = await response.text()

    FileService.write('eslint.config.js', text)

    s.stop('Fetching ESLint config')

    note('ESLint config has been generated', 'ESLint config')

    const install = await askBoolean('Do you want to install ESLint and @hrcd/eslint-config?')

    if (install) {
      s.start('Installing eslint and @hrcd/eslint-config')
      await addDevDependency('eslint', {
        silent: true
      })
      await addDevDependency('@hrcd/eslint-config', {
        silent: true
      })
      s.stop('Installing ESLint and @hrcd/eslint-config')
    }
  } catch (error) {
    handleCancel('Failed to fetch ESLint config')
  }
}
