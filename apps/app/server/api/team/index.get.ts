import prisma from "~/server/database/client";
import { H3Event } from "h3";

export default eventHandler(async (event: H3Event) => {
  const user = event.context.user;
  return await prisma.team.findMany({
    where: {
      roles: {
        some: {
          userId: user.id,
        },
      }
    },
    include: {
      roles: {
        include: {
          user: true,
        }
      }
    }
  });
});
