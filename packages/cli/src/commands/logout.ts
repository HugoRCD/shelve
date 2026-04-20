import { intro, outro } from '@clack/prompts'
import { defineCommand } from 'citty'
import { CredentialsService } from '../services'
import { loadShelveConfig } from '../utils'

export default defineCommand({
  meta: {
    name: 'logout',
    description: 'Logout from Shelve locally',
  },
  async run() {
    intro('Logging out')
    const { url } = await loadShelveConfig()
    await CredentialsService.clearToken(url)
    outro('Successfully logged out')
  },
})
