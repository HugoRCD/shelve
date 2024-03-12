import { defineCommand } from "citty";
import consola from "consola";

export default defineCommand({
  meta: {
    name: 'whoami',
    description: 'Shows the username of the currently logged in user.',
  },
  async setup() {
    /*const user = await fetchUser()
    if (!user) {
      consola.info('Not currently logged in.')
      return
    }
    consola.info(`Logged in as \`${user.name}\``)*/
  },
})
