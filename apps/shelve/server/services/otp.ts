import { eq, sql } from 'drizzle-orm'
import { otpRequests } from '../db/schema'

const OTP_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000
const OTP_MAX_REQUESTS_PER_WINDOW = 3

/**
 * Takes one of the email's code requests for the current hour, whether or not the email has an account.
 * Checking and counting are one statement, so parallel requests can't both take the last one.
 */
export async function reserveOTPRequest(email: string): Promise<{ allowed: boolean; retryAfterMinutes?: number }> {
  const now = new Date()
  const windowStart = new Date(now.getTime() - OTP_RATE_LIMIT_WINDOW_MS)
  const expired = sql`${otpRequests.windowStart} < ${windowStart}`
  const reserved = await db
    .insert(otpRequests)
    .values({ email, count: 1, windowStart: now })
    .onConflictDoUpdate({
      target: otpRequests.email,
      set: {
        count: sql`case when ${expired} then 1 else ${otpRequests.count} + 1 end`,
        windowStart: sql`case when ${expired} then ${now} else ${otpRequests.windowStart} end`,
      },
      setWhere: sql`${expired} or ${otpRequests.count} < ${OTP_MAX_REQUESTS_PER_WINDOW}`,
    })
    .returning({ email: otpRequests.email })
  if (reserved.length) return { allowed: true }

  const [current] = await db.select({ windowStart: otpRequests.windowStart }).from(otpRequests).where(eq(otpRequests.email, email))
  const retryAfterMs = (current?.windowStart.getTime() ?? now.getTime()) + OTP_RATE_LIMIT_WINDOW_MS - now.getTime()
  return { allowed: false, retryAfterMinutes: Math.max(1, Math.ceil(retryAfterMs / 60000)) }
}
