import type { Environment, Variable } from '@types'

export function formatEnvString(variables: Variable[], envId: number): string {
  const grouped = new Map<string, { description: string; vars: Variable[] }>()
  const ungrouped: Variable[] = []

  for (const variable of variables) {
    if (variable.group) {
      const existing = grouped.get(variable.group.name)
      if (existing) {
        existing.vars.push(variable)
      } else {
        grouped.set(variable.group.name, {
          description: variable.group.description,
          vars: [variable],
        })
      }
    } else {
      ungrouped.push(variable)
    }
  }

  const lines: string[] = []
  const getValue = (v: Variable) => v.values.find((val) => val.environmentId === envId)?.value ?? ''

  for (const [name, { description, vars }] of grouped) {
    if (lines.length > 0) lines.push('')
    lines.push(`# ---- ${name} ----`)
    if (description) lines.push(`# ${description}`)
    for (const v of vars) {
      if (v.description) lines.push(`# ${v.description}`)
      lines.push(`${v.key}=${getValue(v)}`)
    }
  }

  if (ungrouped.length > 0) {
    if (grouped.size > 0) lines.push('')
    for (const v of ungrouped) {
      if (v.description) lines.push(`# ${v.description}`)
      lines.push(`${v.key}=${getValue(v)}`)
    }
  }

  return lines.join('\n')
}

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
    copyToClipboard(formatEnvString(variables, envId), `Copied to clipboard for ${env.name}`)
    return
  }
  const devId = teamEnv.value.find((env) => env.name === 'development')?.id
  if (devId) {
    copyToClipboard(formatEnvString(variables, devId), 'Copied to clipboard')
  }
}

export function downloadEnv(variables: Variable[], env: Environment) {
  if (variables.length === 0) return
  const envVariables = variables.filter((variable) => variable.values.some((value) => value.environmentId === env.id))
  const envString = formatEnvString(envVariables, env.id)
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
