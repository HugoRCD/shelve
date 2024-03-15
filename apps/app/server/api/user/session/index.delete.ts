import { deleteSessions } from "~/server/app/sessionService";
import { H3Event } from "h3";

export default eventHandler(async (event: H3Event) => {
  const authToken = event.context.authToken;
  const user = event.context.user;
  await deleteSessions(user.id, authToken);
  return {
    statusCode: 200,
    message: "sessions deleted",
  };
});
