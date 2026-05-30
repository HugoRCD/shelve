import { defineCommand } from 'citty'
import { isJson, loadShelveConfig, redactConfig } from '../utils'
import { cliSuccess } from '../utils/output'

export default defineCommand({
  meta: {
    name: 'config',
    description: 'Show the current configuration',
  },
  async run() {
    const config = redactConfig(await loadShelveConfig(true))
    if (isJson()) {
      cliSuccess(config, undefined, 'config')
      return
    }
    console.log(JSON.stringify(config, null, 2))
  },
})
