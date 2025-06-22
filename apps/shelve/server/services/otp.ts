import type { User } from '@types'
import type { H3Event } from 'h3'
import { gt } from 'drizzle-orm'
import { users } from '../database/schema'
import { handleEmailUser } from './user'

const db = useDrizzle()
const OTP_EXPIRY_MINUTES = 10

export function generateOTPCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function generateOTPForEmail(email: string, event: H3Event): Promise<string> {
  const code = generateOTPCode()
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

  await handleEmailUser(email, event)

  await db
    .update(users)
    .set({
      otpCode: code,
      otpExpiresAt: expiresAt,
    })
    .where(eq(users.email, email))

  return code
}

export async function verifyOTPForUser(email: string, code: string): Promise<{ success: boolean; message: string; user?: User }> {
  const user = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.email, email),
        eq(users.otpCode, code),
        gt(users.otpExpiresAt, new Date())
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
      otpExpiresAt: null,
    })
    .where(
      gt(users.otpExpiresAt, new Date())
    )
} 
