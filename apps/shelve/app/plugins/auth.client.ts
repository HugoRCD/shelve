export default defineNuxtPlugin(async () => {
  await useAuth().fetch()
})
