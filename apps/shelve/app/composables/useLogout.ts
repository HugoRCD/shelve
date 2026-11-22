export async function useLogout() {
  await useAuth().clear()
  navigateTo('/login')
}
