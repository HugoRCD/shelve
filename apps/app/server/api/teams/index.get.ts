import prisma from "~/server/database/client";
import { H3Event } from "h3";

export default eventHandler(async (event: H3Event) => {
  const user = event.context.user;
  return await prisma.team.findMany({
    where: {
      members: {
        some: {
          userId: user.id,
        },
      }
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              avatar: true,
            }
          }
        }
      }
    }
  });
});
