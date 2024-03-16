import { User, DeviceInfo, SessionWithCurrent } from "@shelve/types";
import prisma from "~/server/database/client";

export async function createSession(user: User, authToken: string, deviceInfo: DeviceInfo) {
  return await prisma.session.create({
    data: {
      user: {
        connect: {
          id: user.id,
        },
      },
      authToken,
      device: deviceInfo.userAgent,
      isCli: deviceInfo.isCli,
      location: deviceInfo.location,
    },
  });
}

export async function getSessions(userId: number, authToken: string): Promise<SessionWithCurrent[]> {
  const sessions = await prisma.session.findMany({
    where: {
      userId,
    },
  });
  return sessions.map((session) => ({
    ...session,
    current: session.authToken === authToken,
  })) as SessionWithCurrent[];
}

export async function deleteSession(authToken: string, userId: number) {
  return await prisma.session.delete({
    where: {
      authToken,
      userId,
    },
  });
}

export async function deleteSessions(userId: number, authToken: string) {
  return await prisma.session.deleteMany({
    where: {
      userId,
      authToken: {
        not: authToken,
      },
    },
  });
}
