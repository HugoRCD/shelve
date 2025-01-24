import type { Environment, Variable } from '~~/types'

export function copyEnv(variables: Variable[], envId?: number) {
  if (variables.length === 0) {
    toast.error('No variables found')
    return
  }
  const teamEnv = useEnvironments()
  if (envId) {
    const env = teamEnv.value.find((env) => env.id === envId)
    if (!env) {
      toast.error('Environment not found')
      return
    }
    const envString = variables.map((variable) => `${ variable.key }=${ variable.values.find((value) => value.environmentId === envId)?.value }`).join('\n')
    copyToClipboard(envString, `Copied to clipboard for ${ env.name }`)
    return
  }
  const devId = teamEnv.value.find((env) => env.name === 'development')?.id
  const envString = variables.map((variable) => `${ variable.key }=${ variable.values.find((value) => value.environmentId === devId)?.value }`).join('\n')
  copyToClipboard(envString, 'Copied to clipboard')
}

export function downloadEnv(variables: Variable[], env: Environment) {
  if (variables.length === 0) return
  const envVariables = variables.filter((variable) => variable.values.some((value) => value.environmentId === env.id))
  const envString = envVariables.map((variable) => `${variable.key}=${variable.values.find((value) => value.environmentId === env.id)?.value}`).join('\n')
  const blob = new Blob([envString], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `.env.${env.name}`
  a.click()
  URL.revokeObjectURL(url)
}

export function actionVariablesItem() {
  const teamEnv = useEnvironments()
  const route = useRoute()
  const projectId = route.params.projectId as string
  const variables = useVariables(projectId)
  const copyItem = teamEnv.value.map((env) => ({
    label: `For ${capitalize(env.name)}`,
    icon: 'lucide:clipboard',
    onSelect: () => copyEnv(variables.value, env.id)
  }))
  const downloadItem = teamEnv.value.map((env) => ({
    label: `For ${capitalize(env.name)}`,
    icon: 'lucide:download',
    onSelect: () => downloadEnv(variables.value, env)
  }))
  return [
    [
      {
        label: 'Copy .env',
        disabled: true
      }
    ],
    copyItem,
    [
      {
        label: 'Download .env',
        disabled: true
      }
    ],
    downloadItem
  ]
}
