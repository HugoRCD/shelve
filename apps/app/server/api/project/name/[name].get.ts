import prisma from "~/server/database/client";
import { H3Event } from "h3";

export default eventHandler(async (event: H3Event) => {
  const user = event.context.user;
  const name = getRouterParam(event, "name") as string;
  if (!name) throw createError({ statusCode: 400, statusMessage: "Missing params" });
  return await prisma.project.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
  });
});
