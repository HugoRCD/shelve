import { AuthType } from '@types'
import { gt } from 'drizzle-orm'
import { eq, and } from '../utils/drizzle'
import { users } from '../database/schema'

const db = useDrizzle()
const OTP_EXPIRY_MINUTES = 10

export function generateOTPCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function generateOTPForUser(email: string): Promise<string> {
  const code = generateOTPCode()
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

  await db
    .update(users)
    .set({
      otpCode: code,
      otpExpiresAt: expiresAt,
    })
    .where(eq(users.email, email))

  return code
}

export async function verifyOTPForUser(email: string, code: string): Promise<{ success: boolean; message: string; user?: any }> {
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

export async function findOrCreateUserByEmail(email: string): Promise<any> {
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (existingUser.length) {
    return existingUser[0]
  }

  const username = email.split('@')[0] + Math.floor(Math.random() * 1000)
  
  const newUser = await db
    .insert(users)
    .values({
      email,
      username,
      authType: AuthType.EMAIL,
      avatar: 'https://i.imgur.com/6VBx3io.png',
    })
    .returning()

  return newUser[0]
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
