import { afterEach, describe, expect, it } from 'vitest'
import { CliError } from '../src/services/api-error'
import { initCliContextFromArgv } from '../src/utils/cli-context'
import { askText } from '../src/utils/prompt'

afterEach(() => {
  initCliContextFromArgv(['node', 'shelve'])
})

describe('non-interactive prompts', () => {
  it('throws CliError instead of prompting', async () => {
    initCliContextFromArgv(['node', 'shelve', '--non-interactive', 'create'])
    await expect(askText('Enter project name')).rejects.toBeInstanceOf(CliError)
    await expect(askText('Enter project name')).rejects.toMatchObject({
      code: 'MISSING_INPUT',
    })
  })
})
