import { deleteSession } from "~/server/app/sessionService";
import { H3Event } from "h3";

export default eventHandler(async (event: H3Event) => {
  const user = event.context.user;
  const id = getRouterParam(event, "id") as string;
  if (!id) throw createError({ statusCode: 400, statusMessage: "missing params" });
  await deleteSession(parseInt(id), user.id);
  return {
    statusCode: 200,
    message: "session deleted",
  };
});
