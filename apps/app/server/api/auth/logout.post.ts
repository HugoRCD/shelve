import { deleteSession } from "~/server/app/authService";
import { H3Event } from "h3";

export default eventHandler(async (event: H3Event) => {
  const authToken = getCookie(event, "authToken");
  deleteCookie(event, "authToken");
  if (!authToken) {
    return {
      statusCode: 200,
      body: {
        message: "Logged out",
      },
    };
  }
  await deleteSession(authToken);
  return {
    statusCode: 200,
    body: {
      message: "Logged out",
    },
  };
});
