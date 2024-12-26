import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event)
  console.log(body)
  return {
    status: 200,
    body: 'Hello from GitHub!',
  }
})
