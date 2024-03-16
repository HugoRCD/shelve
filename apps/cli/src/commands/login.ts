import { getComputerName, loadUserConfig, writeUserConfig } from '../utils/config'
import { $api } from "../utils/connection.ts";
import { defineCommand } from 'citty'
import { consola } from 'consola'

export default defineCommand({
  meta: {
    name: 'login',
    description: 'Authenticate with Shelve'
  },
  async setup() {
    const user = loadUserConfig()
    if (user.authToken) return consola.info(`You are already logged as \`${user.username}\``)

    const email = await consola.prompt('Enter your email') as string;
    consola.start('Sending code to your email...')
    await $api("/auth/send-code", {
      method: "POST",
      body: {
        email
      }
    })
    consola.success('Code sent.')
    const code = await consola.prompt('Enter the code') as string;
    consola.start('Logging in...')
    const response = await $api("/auth/login", {
      method: "POST",
      body: {
        email,
        otp: code,
        deviceInfo: {
          isCli: true,
          userAgent: getComputerName()
        }
      }
    })
    writeUserConfig({
      username: response.username,
      email: response.email,
      authToken: response.authToken
    })
    consola.info(`You are now logged in as \`${response.username}\``)
  },
})
