import type { Session, User, DeviceInfo } from "@shelve/types";
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

export async function getSessions(userId: number, authToken: string): Promise<Session[]> {
  const sessions = await prisma.session.findMany({
    where: {
      userId,
    },
  });
  return sessions.map((session) => ({
    ...session,
    current: session.authToken === authToken,
  }));
}

export async function deleteSession(id: number, userId: number) {
  return await prisma.session.delete({
    where: {
      id,
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
