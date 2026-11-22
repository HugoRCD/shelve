export default defineEventHandler((event) => {
  return useServerAuth().handler(toWebRequest(event))
})
