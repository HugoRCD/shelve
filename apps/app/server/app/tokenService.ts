import prisma from '~~/server/database/client'

function updateUsedAt(token: string) {
  return prisma.cliToken.update({
    where: {
      token,
    },
    data: {
      updatedAt: new Date(),
    },
  })
}

export async function getUserByAuthToken(token: string) {
  const user = await prisma.cliToken.findUnique({
    where: {
      token,
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
  await updateUsedAt(token)
  return user
}

export function getTokensByUserId(userId: number) {
  return prisma.cliToken.findMany({
    where: {
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

function generateUserToken(userId) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''

  const userIdHash = Array.from(userId).reduce((acc, char) => acc + char.charCodeAt(0), 0)

  for (let i = 0; i < 25; i++) {
    const randomIndex = (Math.floor(Math.random() * characters.length) + userIdHash) % characters.length
    token += characters.charAt(randomIndex)
  }

  return token
}

export async function createToken({ name, userId }: { name: string, userId: number }) {
  const token = generateUserToken(userId)

  await prisma.cliToken.create({
    data: {
      token,
      name,
      userId
    },
  })
}
