import { users } from '../db/schema'

const OTP_RATE_LIMIT_WINDOW_MINUTES = 60
const OTP_MAX_ATTEMPTS_PER_WINDOW = 3

export async function checkOTPRateLimit(email: string): Promise<{ allowed: boolean; retryAfterMinutes?: number }> {
  const [user] = await db
    .select({ otpAttempts: users.otpAttempts, otpLastRequestAt: users.otpLastRequestAt })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (!user?.otpLastRequestAt || !user.otpAttempts) return { allowed: true }

  const windowStart = new Date(Date.now() - OTP_RATE_LIMIT_WINDOW_MINUTES * 60 * 1000)
  if (user.otpLastRequestAt < windowStart) return { allowed: true }

  if (user.otpAttempts >= OTP_MAX_ATTEMPTS_PER_WINDOW) {
    const retryAfter = Math.ceil((user.otpLastRequestAt.getTime() + OTP_RATE_LIMIT_WINDOW_MINUTES * 60 * 1000 - Date.now()) / 60000)
    return { allowed: false, retryAfterMinutes: retryAfter }
  }

  return { allowed: true }
}

/** Counts a code request against an existing user's hourly limit. New emails have no row until they sign in. */
export async function recordOTPRequest(email: string): Promise<void> {
  const [user] = await db
    .select({ otpAttempts: users.otpAttempts, otpLastRequestAt: users.otpLastRequestAt })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
  if (!user) return

  const windowStart = new Date(Date.now() - OTP_RATE_LIMIT_WINDOW_MINUTES * 60 * 1000)
  const isWithinWindow = user.otpLastRequestAt && user.otpLastRequestAt > windowStart
  await db
    .update(users)
    .set({ otpAttempts: isWithinWindow ? (user.otpAttempts || 0) + 1 : 1, otpLastRequestAt: new Date() })
    .where(eq(users.email, email))
}
