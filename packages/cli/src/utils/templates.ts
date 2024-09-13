import fs from 'fs'
import { addDevDependency } from 'nypm'
import { spinner, confirm, isCancel, note, intro } from '@clack/prompts'
import { onCancel } from './index'

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

    fs.writeFileSync('./eslint.config.js', text)

    s.stop('Fetching ESLint config')

    note('ESLint config has been generated', 'ESLint config')

    const install = await confirm({
      message: 'Do you want to install ESLint and @hrcd/eslint-config?'
    })

    if (isCancel(install)) onCancel('Operation cancelled.')

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
    onCancel('Failed to fetch ESLint config')
  }
}
