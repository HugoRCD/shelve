import type { CreateSessionInput, User } from '@shelve/types'
import bcrypt from 'bcryptjs'
import { createSession } from '~/server/app/sessionService'
import { getUserByEmail } from '~/server/app/userService'
import prisma from '~/server/database/client'

export async function login(createSessionDto: CreateSessionInput): Promise<{ user: User; authToken: string }> {
  const user = await getUserByEmail(createSessionDto.email.trim())
  if (!user) throw createError({ statusCode: 404, statusMessage: 'user_not_found' })
  if (createSessionDto.password && user.password) {
    const isPasswordCorrect = bcrypt.compare(createSessionDto.password, user.password)
    if (!isPasswordCorrect) throw createError({ statusCode: 401, statusMessage: 'invalid_password' })
    return await createSession(user as User, createSessionDto)
  }
  if (!user.otp) throw createError({ statusCode: 400, statusMessage: 'otp_not_set' })
  const isOtpCorrect = await bcrypt.compare(createSessionDto.otp, user.otp)
  if (!isOtpCorrect) throw createError({ statusCode: 401, statusMessage: 'invalid_otp' })
  await deleteOtp(user.id)
  return await createSession(user as User, createSessionDto)
}

export async function generateOtp() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const encryptedOtp = await bcrypt.hash(otp, 10)
  return { otp, encryptedOtp }
}

export async function deleteOtp(userId: number) {
  return await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      otp: null
    },
  })
}
