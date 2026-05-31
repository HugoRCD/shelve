import { z } from 'zod'
import { startDeviceAuth } from '~~/server/services/cli-device-auth'

const bodySchema = z.object({
  hostname: z.string().max(128).optional(),
  platform: z.string().max(64).optional(),
  cliVersion: z.string().max(32).optional(),
}).optional()

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => undefined)
  const parsed = bodySchema.safeParse(body)
  let clientMeta = parsed.success && parsed.data
    ? {
      hostname: parsed.data.hostname,
      platform: parsed.data.platform,
      cliVersion: parsed.data.cliVersion,
    }
    : undefined

  const ua = getRequestHeader(event, 'user-agent')
  const versionMatch = ua?.match(/shelve-cli\/([^\s)]+)/i)
  if (versionMatch?.[1]) {
    clientMeta = { ...clientMeta, cliVersion: versionMatch[1] }
  }

  return startDeviceAuth(event, clientMeta)
})
