import type { User } from '@types'
import type { H3Event } from 'h3'
import { lt, gt, and } from 'drizzle-orm'
import { users } from '../db/schema'
import { handleEmailUser } from './user'

const OTP_EXPIRY_MINUTES = 10
const OTP_RATE_LIMIT_WINDOW_MINUTES = 60
const OTP_MAX_ATTEMPTS_PER_WINDOW = 3

export function generateOTPCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function generateOTPToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export async function checkOTPRateLimit(email: string): Promise<{ allowed: boolean; retryAfterMinutes?: number }> {
  const user = await db
    .select({
      otpAttempts: users.otpAttempts,
      otpLastRequestAt: users.otpLastRequestAt,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (!user.length) {
    return { allowed: true }
  }

  const { otpAttempts, otpLastRequestAt } = user[0]

  if (!otpLastRequestAt || !otpAttempts) {
    return { allowed: true }
  }

  const windowStart = new Date(Date.now() - OTP_RATE_LIMIT_WINDOW_MINUTES * 60 * 1000)

  if (otpLastRequestAt < windowStart) {
    return { allowed: true }
  }

  if (otpAttempts >= OTP_MAX_ATTEMPTS_PER_WINDOW) {
    const retryAfter = Math.ceil((otpLastRequestAt.getTime() + OTP_RATE_LIMIT_WINDOW_MINUTES * 60 * 1000 - Date.now()) / 60000)
    return { allowed: false, retryAfterMinutes: retryAfter }
  }

  return { allowed: true }
}

export async function generateOTPForEmail(email: string, event: H3Event): Promise<{ code: string; token: string }> {
  const code = generateOTPCode()
  const token = generateOTPToken()
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

  await handleEmailUser(email, event)

  const existingUser = await db
    .select({ otpAttempts: users.otpAttempts, otpLastRequestAt: users.otpLastRequestAt })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  const windowStart = new Date(Date.now() - OTP_RATE_LIMIT_WINDOW_MINUTES * 60 * 1000)
  const isWithinWindow = existingUser[0]?.otpLastRequestAt && existingUser[0].otpLastRequestAt > windowStart
  const newAttempts = isWithinWindow ? (existingUser[0]?.otpAttempts || 0) + 1 : 1

  await db
    .update(users)
    .set({
      otpCode: code,
      otpToken: token,
      otpExpiresAt: expiresAt,
      otpAttempts: newAttempts,
      otpLastRequestAt: new Date(),
    })
    .where(eq(users.email, email))

  return { code, token }
}

export async function verifyOTPByToken(token: string): Promise<{ success: boolean; message: string; user?: User; email?: string }> {
  const user = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.otpToken, token),
        gt(users.otpExpiresAt!, new Date())
      )
    )
    .limit(1)

  if (!user.length) {
    return { success: false, message: 'Invalid or expired link' }
  }

  await db
    .update(users)
    .set({
      otpCode: null,
      otpToken: null,
      otpExpiresAt: null,
    })
    .where(eq(users.id, user[0].id))

  return { success: true, message: 'OTP verified successfully', user: user[0], email: user[0].email }
}

export async function verifyOTPForUser(email: string, code: string): Promise<{ success: boolean; message: string; user?: User }> {
  const user = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.email, email),
        eq(users.otpCode, code),
        gt(users.otpExpiresAt!, new Date())
      )
    )
    .limit(1)

  if (!user.length) {
    return { success: false, message: 'Invalid or expired OTP code' }
  }

  await db
    .update(users)
    .set({
      otpCode: null,
      otpToken: null,
      otpExpiresAt: null,
    })
    .where(eq(users.id, user[0].id))

  return { success: true, message: 'OTP verified successfully', user: user[0] }
}

export async function clearExpiredOTPs(): Promise<void> {
  await db
    .update(users)
    .set({
      otpCode: null,
      otpToken: null,
      otpExpiresAt: null,
    })
    .where(
      lt(users.otpExpiresAt!, new Date())
    )
}
