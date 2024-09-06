import type { publicUser, User, CreateUserInput, UpdateUserInput } from '@shelve/types'
import { Role } from '@shelve/types'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { deleteSession } from '~~/server/app/sessionService'
import prisma, { formatUser } from '~~/server/database/client'
import { generateOtp } from '~~/server/app/authService'
import { sendOtp } from '~~/server/app/resendService'

export async function upsertUser(createUserInput: CreateUserInput, provider: 'local' | 'github' = 'local'): Promise<publicUser> {
  const foundUser = await prisma.user.findUnique({
    where: {
      username: createUserInput.username,
    },
  })
  const newUsername = foundUser ? `${createUserInput.username}_#${Math.floor(Math.random() * 1000)}` : createUserInput.username
  if (provider === 'local') {
    const { otp, encryptedOtp } = await generateOtp()
    let { password } = createUserInput
    if (password) password = await bcrypt.hash(password, 10)
    const user = await prisma.user.upsert({
      where: {
        email: createUserInput.email,
      },
      update: {
        updatedAt: new Date(),
        otp: encryptedOtp,
        password,
      },
      create: {
        ...createUserInput,
        username: newUsername,
        password,
        otp: encryptedOtp,
      },
    })
    if (!createUserInput.password) await sendOtp(user.email, otp)
    return formatUser(user)
  }
  const user = await prisma.user.upsert({
    where: {
      email: createUserInput.email,
    },
    update: {
      updatedAt: new Date(),
    },
    create: {
      ...createUserInput,
      username: newUsername,
    },
  })
  return formatUser(user)
}

export function getUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: {
      email,
    }
  })
}

export async function deleteUser(userId: number): Promise<void> {
  await prisma.user.delete({
    where: {
      id: userId,
    },
  })
}

export async function updateUser(user: User, updateUserInput: UpdateUserInput, authToken: string): Promise<publicUser> {
  const newUsername = updateUserInput.username
  if (newUsername && newUsername !== user.username) {
    const usernameTaken = await prisma.user.findFirst({
      where: {
        username: newUsername,
      },
    })
    if (usernameTaken) throw createError({ statusCode: 400, message: 'Username already taken' })
  }
  if (updateUserInput.password) {
    updateUserInput.password = await bcrypt.hash(updateUserInput.password, 10)
  }
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: updateUserInput,
  })
  await removeCachedUserToken(authToken)
  return formatUser(updatedUser)
}

export async function removeCachedUserToken(authToken: string): Promise<void> {
  await useStorage('redis').removeItem(`nitro:functions:getUserByAuthToken:authToken:${authToken}.json`)
}
