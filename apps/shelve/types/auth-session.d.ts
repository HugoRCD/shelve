export {}

import type { AppSession } from '../server/utils/session'

declare module 'h3' {
  interface H3EventContext {
    /**
     * Request-level auth context resolved by getAppSession().
     * source="session": Better Auth-backed session.
     * source="token": CLI authToken cookie fallback.
     */
    appSession?: AppSession | null
  }
}
