import { z } from 'zod'
import { getDeviceAuthStatus } from '~~/server/services/cli-device-auth'

const querySchema = z.object({
  user_code: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  const { user_code: userCode } = await getValidatedQuery(event, querySchema.parse)
  return getDeviceAuthStatus(userCode)
})
