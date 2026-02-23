export async function useLogout() {
  const { signOut } = useUserSession()
  const defaultTeamSlug = useCookie<string | null>('defaultTeamSlug')
  defaultTeamSlug.value = null
  await signOut()
  navigateTo('/login')
}
