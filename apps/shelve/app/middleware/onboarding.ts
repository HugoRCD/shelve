export default defineNuxtRouteMiddleware(() => {
  const { user } = useUserSession()

  if (user.value && !user.value.onboarding) {
    toast.error('You need to complete the onboarding process to access this page.')
    return navigateTo('/onboarding')
  }
})
