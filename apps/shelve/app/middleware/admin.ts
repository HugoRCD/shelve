import { Role } from '@shelve/types'

export default defineNuxtRouteMiddleware((): Promise<void> => {
  const { user } = useUserSession()
  if (!user.value.role === Role.ADMIN) {
    toast.error('You need to be an admin to access this page.')
    return '/app/projects'
  }
})
