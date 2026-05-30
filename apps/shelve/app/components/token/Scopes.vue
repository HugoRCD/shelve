<script setup lang="ts">
import type { Token } from '@types'

const props = defineProps<{
  token: Token
}>()

const { scopeLabels, fetchScopeLabels, teamName, projectName, environmentName } = useScopeLabels()

onMounted(() => fetchScopeLabels())

const scopeChips = computed(() => {
  const chips: { label: string; icon: string }[] = []
  const s = props.token.scopes
  if (s.teamIds?.length) chips.push({ label: `${s.teamIds.length} team${s.teamIds.length === 1 ? '' : 's'}`, icon: 'lucide:users' })
  if (s.projectIds?.length) chips.push({ label: `${s.projectIds.length} project${s.projectIds.length === 1 ? '' : 's'}`, icon: 'lucide:folder' })
  if (s.environmentIds?.length) chips.push({ label: `${s.environmentIds.length} env${s.environmentIds.length === 1 ? '' : 's'}`, icon: 'lucide:layers' })
  if (props.token.allowedCidrs?.length) chips.push({ label: `${props.token.allowedCidrs.length} CIDR${props.token.allowedCidrs.length === 1 ? '' : 's'}`, icon: 'lucide:shield' })
  return chips
})

function formatList(ids: number[] | undefined, resolver: (id: number) => string): string | null {
  if (!ids?.length) return null
  return ids.map(resolver).join(', ')
}

const tooltip = computed(() => {
  const s = props.token.scopes
  const lines: string[] = []
  const teams = formatList(s.teamIds, teamName)
  const projects = formatList(s.projectIds, projectName)
  const envs = formatList(s.environmentIds, environmentName)
  if (teams) lines.push(`Teams: ${teams}`)
  if (projects) lines.push(`Projects: ${projects}`)
  if (envs) lines.push(`Environments: ${envs}`)
  if (props.token.allowedCidrs?.length) lines.push(`Allowed CIDRs: ${props.token.allowedCidrs.join(', ')}`)
  return lines.join('\n')
})
</script>

<template>
  <div class="flex flex-wrap items-center gap-1">
    <UBadge
      v-for="permission in token.scopes.permissions"
      :key="permission"
      size="sm"
      :color="permission === 'write' ? 'warning' : 'neutral'"
      variant="subtle"
    >
      {{ permission }}
    </UBadge>
    <UTooltip v-if="scopeChips.length" :text="tooltip" :delay-duration="50">
      <div class="flex flex-wrap items-center gap-1">
        <UBadge
          v-for="chip in scopeChips"
          :key="chip.label"
          size="sm"
          color="info"
          variant="subtle"
          :icon="chip.icon"
        >
          {{ chip.label }}
        </UBadge>
      </div>
    </UTooltip>
    <UBadge v-else size="sm" color="neutral" variant="outline" class="text-muted">
      unscoped
    </UBadge>
  </div>
</template>
