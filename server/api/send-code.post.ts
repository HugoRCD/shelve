import { H3Event } from "h3";

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event);
  console.log(body.email);
  // your_api_logic
  return {
    code: 200,
  }
});
