import { Role } from '@shelve/types'

export default defineNuxtRouteMiddleware(() => {
  const { user } = useUserSession()
  if (user.value?.role !== Role.ADMIN) return navigateTo('/')
})
