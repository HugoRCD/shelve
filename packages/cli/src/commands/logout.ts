import { defineCommand } from 'citty'
import { CredentialsService } from '../services'
import { cliIntro, cliSuccess, loadShelveConfig } from '../utils'

export default defineCommand({
  meta: {
    name: 'logout',
    description: 'Logout from Shelve locally',
  },
  async run() {
    cliIntro('Logging out')
    const { url } = await loadShelveConfig()
    await CredentialsService.clearToken(url)
    cliSuccess({ loggedOut: true }, 'Successfully logged out', 'logout')
  },
})
