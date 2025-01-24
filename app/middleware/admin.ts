import { Role } from '~~/types'

export default defineNuxtRouteMiddleware(() => {
  const { user } = useUserSession()
  if (user.value && user.value.role !== Role.ADMIN) {
    toast.error('You are not authorized to access this page')
    return navigateTo('/')
  }
})
