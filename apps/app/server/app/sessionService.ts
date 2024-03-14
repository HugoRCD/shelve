import prisma from "~/server/database/client";
import type { User } from "@shelve/types";

export async function createSession(user: User, authToken: string) {
  return await prisma.session.create({
    data: {
      user: {
        connect: {
          id: user.id,
        },
      },
      authToken,
    },
  });
}

export async function deleteSession(authToken: string) {
  return await prisma.session.delete({
    where: {
      authToken,
    },
  });
}

export async function deleteSessions(userId: number) {
  return await prisma.session.deleteMany({
    where: {
      userId,
    },
  });
}
