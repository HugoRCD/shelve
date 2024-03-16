import prisma from "~/server/database/client";
import { H3Event } from "h3";

export default eventHandler(async (event: H3Event) => {
  const user = event.context.user;
  const id = getRouterParam(event, "id") as string;
  if (!id) throw createError({ statusCode: 400, statusMessage: "missing params" });
  await prisma.session.delete({
    where: {
      id: parseInt(id),
      userId: user.id,
    },
  });
  return {
    statusCode: 200,
    message: "session deleted",
  };
});
