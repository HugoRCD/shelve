import { Role } from '@shelve/types'

export default defineNuxtRouteMiddleware(() => {
  const { user } = useUserSession()
  if (user.value?.role !== Role.ADMIN) {
    toast.error('You are not authorized to access this page')
    return navigateTo('/')
  }
})
