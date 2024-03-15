import { getSessions } from "~/server/app/sessionService";
import { H3Event } from "h3";

export default eventHandler(async (event: H3Event) => {
  const authToken = event.context.authToken;
  const user = event.context.user;
  return await getSessions(user.id, authToken) || [];
});
