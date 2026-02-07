import { Role } from '@types'

export default defineNuxtRouteMiddleware(async () => {
  const { user, loggedIn, waitForSession } = useUserSession()
  await waitForSession()

  if (!loggedIn.value) {
    return navigateTo('/login')
  }

  if (user.value && user.value.role !== Role.ADMIN) {
    toast.error('You are not authorized to access this page')
    return navigateTo('/')
  }
})
