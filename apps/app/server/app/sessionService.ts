import type { User, SessionWithCurrent, CreateSessionInput } from '@shelve/types'
import jwt from 'jsonwebtoken'
import { removeCachedUserToken } from '~~/server/app/userService'

const runtimeConfig = useRuntimeConfig().private

export async function createSession(user: User, createSessionDto: CreateSessionInput): Promise<{ user: User; authToken: string }> {
  const authToken = jwt.sign(
    {
      id: user.id,
      role: user.role,
      username: user.username,
      email: user.email,
    },
    runtimeConfig.authSecret,
    { expiresIn: '30d' },
  )
  await prisma.session.create({
    data: {
      authToken,
      userId: user.id,
      device: createSessionDto.deviceInfo.userAgent,
      isCli: createSessionDto.deviceInfo.isCli,
      location: createSessionDto.deviceInfo.location,
    },
  })
  return {
    user,
    authToken,
  }
}

export async function getSessions(userId: number, authToken: string): Promise<SessionWithCurrent[]> {
  const sessions = await prisma.session.findMany({
    where: {
      userId,
    },
  })
  return sessions.map((session) => ({
    ...session,
    current: session.authToken === authToken,
  })) as SessionWithCurrent[]
}

export async function deleteSession(authToken: string, userId: number): Promise<void> {
  await removeCachedUserToken(authToken)
  await prisma.session.delete({
    where: {
      authToken,
      userId,
    },
  })
}

export async function deleteSessions(userId: number, authToken: string): Promise<void> {
  await prisma.session.deleteMany({
    where: {
      userId,
      authToken: {
        not: authToken,
      },
    },
  })
}
