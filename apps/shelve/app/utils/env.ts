import type { Variable } from '@shelve/types'

export function copyEnv(variables: Variable[], env: string) {
  if (variables.length === 0) return
  if (env) {
    const envVariables = variables.filter((variable) => variable.environment.includes(env))
    const envString = envVariables.map((variable) => `${ variable.key }=${ variable.value }`).join('\n')
    copyToClipboard(envString, 'Copied to clipboard')
    return
  }
  const envString = variables.map((variable) => `${ variable.key }=${ variable.value }`).join('\n')
  copyToClipboard(envString, 'Copied to clipboard')
}

export function downloadEnv(variables: Variable[], env: 'production' | 'preview' | 'development') {
  if (variables.length === 0) return
  const envVariables = variables.filter((variable) => variable.environment.includes(env))
  const envString = envVariables.map((variable) => `${variable.key}=${variable.value}`).join('\n')
  const blob = new Blob([envString], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `.env.${env}`
  a.click()
  URL.revokeObjectURL(url)
}
