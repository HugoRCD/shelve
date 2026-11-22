/**
 * Returns `path` when redirecting to it stays on this site, otherwise `undefined`.
 * Browsers read `/\host` and paths with tabs or newlines as other sites, so those are refused too.
 */
export function getSafeRedirectPath(path: unknown): string | undefined {
  if (typeof path !== 'string' || !path.startsWith('/') || /[\\\u0000-\u001F\u007F]/.test(path)) return
  const base = 'http://localhost'
  return new URL(path, base).origin === base ? path : undefined
}
