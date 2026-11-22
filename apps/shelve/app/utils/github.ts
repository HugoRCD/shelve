import { GITHUB_SIGN_IN_REQUIRED } from '~~/shared/github'

/** Whether the API refused a GitHub action because this session has no GitHub sign-in. */
export function needsGithubSignIn(error: unknown): boolean {
  return (error as { data?: { data?: { reason?: string } } } | null)?.data?.data?.reason === GITHUB_SIGN_IN_REQUIRED
}

/** Signs in with GitHub, then comes back to the current page. */
export function signInWithGithub() {
  window.location.href = `/auth/github?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`
}

/** Shows why a GitHub action failed, with a sign-in button when it needs a GitHub sign-in. */
export function toastGithubError(error: unknown, fallback: string) {
  const data = (error as { data?: { statusMessage?: string; message?: string } } | null)?.data
  const message = data?.statusMessage || data?.message
  if (needsGithubSignIn(error)) {
    toast.error(message || 'Sign in to Shelve with GitHub to use your repositories', {
      duration: 10000,
      action: { label: 'Sign in with GitHub', onClick: signInWithGithub },
    })
    return
  }
  toast.error(fallback, { description: message })
}
