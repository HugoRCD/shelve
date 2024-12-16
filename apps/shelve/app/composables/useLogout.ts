export async function useLogout() {
  await useUserSession().clear()
  navigateTo('/login')
}
