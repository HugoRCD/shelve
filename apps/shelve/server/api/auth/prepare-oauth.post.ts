import { z } from 'zod'

const bodySchema = z.object({
  provider: z.string(),
  redirectUrl: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const { provider, redirectUrl } = await readValidatedBody(event, bodySchema.parse)
  
  if (redirectUrl) {
    const session = await getUserSession(event)
    await setUserSession(event, {
      ...session,
      pendingOAuthRedirect: redirectUrl
    })
  }
  
  return {
    oauthUrl: `/auth/${provider}`
  }
}) 
