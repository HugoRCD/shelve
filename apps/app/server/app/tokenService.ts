import { seal, unseal } from '@shelve/crypto'
import prisma from '~~/server/database/client'

const { encryptionKey } = useRuntimeConfig().private

function updateUsedAt(token: string) {
  return prisma.token.update({
    where: {
      token,
    },
    data: {
      updatedAt: new Date(),
    },
  })
}

export async function getUserByAuthToken(token: string) {
  const sealedToken = await seal(token, encryptionKey)
  const user = await prisma.token.findUnique({
    where: {
      token: sealedToken,
    },
    select: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          username: true,
        },
      },
    },
  })
  await updateUsedAt(sealedToken)
  return user
}

export async function getTokensByUserId(userId: number) {
  const tokens = await prisma.token.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
  for (const token of tokens) {
    token.token = await unseal(token.token, encryptionKey)
  }
  return tokens
}

function generateUserToken(userId) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''

  const userIdHash = Array.from(userId).reduce((acc, char) => acc + char.charCodeAt(0), 0)

  for (let i = 0; i < 25; i++) {
    const randomIndex = (Math.floor(Math.random() * characters.length) + userIdHash) % characters.length
    token += characters.charAt(randomIndex)
  }

  return `she_${userId}_${token}`
}

export async function createToken({ name, userId }: { name: string, userId: number }) {
  await prisma.token.create({
    data: {
      token: await seal(generateUserToken(userId), encryptionKey),
      name,
      userId
    },
  })
}
