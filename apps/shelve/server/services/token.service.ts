import { seal, unseal } from '@shelve/crypto'

const { encryptionKey } = useRuntimeConfig().private

function updateUsedAt(tokenId: string) {
  return prisma.token.update({
    where: {
      id: tokenId,
    },
    data: {
      updatedAt: new Date(),
    },
  })
}

export async function getUserByAuthToken(authToken: string) {
  const userId = +authToken.split('_')[1]

  const userTokens = await prisma.token.findMany({
    where: {
      userId
    },
  })

  let foundToken

  for (const token of userTokens) {
    token.token = await unseal(token.token, encryptionKey)
    if (token.token === authToken) {
      foundToken = token
      break
    }
  }

  if (!foundToken) throw new Error('Invalid token')

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
    },
  })

  await updateUsedAt(foundToken.id)
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
