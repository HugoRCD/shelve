import { defineClientAuth } from '@onmax/nuxt-better-auth/config'
import { adminClient, emailOTPClient } from 'better-auth/client/plugins'

export default defineClientAuth({
  plugins: [emailOTPClient(), adminClient()],
})
