export async function useLogout() {
  const { signOut } = useAuth()
  const router = useRouter()

  await signOut({
    fetchOptions: {
      onSuccess: () => {
        router.push('/login')
      },
    },
  })
}
