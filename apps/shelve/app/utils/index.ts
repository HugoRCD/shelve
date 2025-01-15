/**
 * Removes the GitHub base URL from a given URL.
 *
 * @param {string} url - The full GitHub URL to be sanitized.
 * @returns {string} - The sanitized URL without the GitHub base URL (only the repository path).
 */
export function sanitizeGithubUrl(url: string) {
  const githubUrl = 'https://github.com/'
  return url.replace(githubUrl, '')
}
