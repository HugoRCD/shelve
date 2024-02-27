import { H3Event } from "h3";
/*import { getUserByAuthToken } from "~/server/app/userService";*/

export default eventHandler(async (event: H3Event) => {
  return null;
  /*const authToken = getCookie(event, "authToken");
  const hasAuthToken = isString(authToken);
  if (!hasAuthToken) return null;
  const user = await getUserByAuthToken(authToken);
  if (!user) return null;
  return user;*/
});
