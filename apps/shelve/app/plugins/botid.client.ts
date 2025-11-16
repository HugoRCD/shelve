import { initBotId } from 'botid/client/core'

export default defineNuxtPlugin({
  enforce: 'pre',
  setup() {
    initBotId({
      protect: [
        { path: '/api/auth/otp/send', method: 'POST' },
        { path: '/api/auth/otp/verify', method: 'POST' },
      ],
    })
  },
})
