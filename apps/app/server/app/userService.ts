import type { publicUser, User, UserCreateInput, UserUpdateInput } from '@shelve/types'
import { Role } from '@shelve/types'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { deleteSession } from '~/server/app/sessionService'
import prisma, { formatUser } from '~/server/database/client'
import { generateOtp } from '~/server/app/authService'
import { sendOtp } from '~/server/app/resendService'

type jwtPayload = {
  id: number;
  role: Role;
  username: string;
  email: string;
};

const runtimeConfig = useRuntimeConfig().private

export async function upsertUser(userCreateInput: UserCreateInput) {
  const { otp, encryptedOtp } = await generateOtp()
  let password = userCreateInput.password
  if (password) password = await bcrypt.hash(password, 10)
  const user = await prisma.user.upsert({
    where: {
      email: userCreateInput.email,
    },
    update: {
      otp: encryptedOtp,
      password,
    },
    create: {
      ...userCreateInput,
      password,
      otp: encryptedOtp,
    },
  })
  if (!userCreateInput.password) await sendOtp(user.email, otp)
  return formatUser(user)
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: {
      email,
    },
    cacheStrategy: { ttl: 60 },
  })
}

export async function deleteUser(userId: number): Promise<void> {
  await prisma.user.delete({
    where: {
      id: userId,
    },
  })
}

export const getUserByAuthToken = cachedFunction(async (authToken: string): Promise<User> => {
  const session = await prisma.session.findFirst({
    where: {
      authToken,
    },
    include: {
      user: true,
    },
  })
  if (!session)
    throw createError({ statusCode: 400, message: 'Invalid token' })
  return session.user
}, {
  maxAge: 60 * 60,
  name: 'getUserByAuthToken',
  getKey: (authToken: string) => `authToken:${authToken}`,
})

export async function verifyUserToken(token: string, user: User): Promise<boolean> {
  try {
    const decoded = jwt.verify(token, runtimeConfig.authSecret) as jwtPayload
    if (decoded.id !== user.id) return false
    return true
  } catch (error) {
    await deleteSession(token, user.id)
    return false
  }
}

export async function updateUser(user: User, updateUserInput: UserUpdateInput, authToken: string): Promise<publicUser> {
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
  await useStorage('cache').removeItem(`nitro:functions:getUserByAuthToken:authToken:${authToken}.json`)
}
