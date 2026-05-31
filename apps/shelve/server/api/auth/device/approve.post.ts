import { z } from 'zod'
import { approveDeviceAuth } from '~~/server/services/cli-device-auth'

const bodySchema = z.object({
  user_code: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  const { user_code: userCode } = await readValidatedBody(event, bodySchema.parse)
  const { user } = await requireUserSession(event)
  return approveDeviceAuth(event, user, userCode)
})
