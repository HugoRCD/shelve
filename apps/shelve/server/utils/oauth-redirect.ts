interface UserSession {
  pendingOAuthRedirect?: string
  [key: string]: any
}

export function handleOAuthRedirect(
  event: any, 
  session: UserSession, 
  defaultRedirect: string
): string {
  const pendingRedirect = session.pendingOAuthRedirect
  
  if (pendingRedirect) {
    try {
      const decodedUrl = decodeURIComponent(pendingRedirect)
      const url = new URL(decodedUrl, getRequestURL(event))
      if (url.origin === getRequestURL(event).origin) {
        return decodedUrl
      }
    } catch {
      // Invalid URL, use default
    }
  }
  
  return defaultRedirect
} 
