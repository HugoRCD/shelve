import { defineCommand } from 'citty'
import { loadShelveConfig } from '../utils'

export default defineCommand({
  meta: {
    name: 'config',
    description: 'Show the current configuration',
  },
  async run() {
    console.log(await loadShelveConfig(true))
  }
})
