import { z } from 'zod'
import { pollDeviceAuthToken } from '~~/server/services/cli-device-auth'

const bodySchema = z.object({
  device_code: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  const { device_code } = await readValidatedBody(event, bodySchema.parse)
  return pollDeviceAuthToken(event, device_code)
})
