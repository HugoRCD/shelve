import { z } from 'zod'
import { denyDeviceAuth } from '~~/server/services/cli-device-auth'

const bodySchema = z.object({
  user_code: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  const { user_code: userCode } = await readValidatedBody(event, bodySchema.parse)
  await requireUserSession(event)
  return denyDeviceAuth(userCode)
})
