<script setup lang="ts">
import type { AuditActorType } from '@types'
import { AUDIT_ACTIONS } from '@types'
import type { AuditLogFilters } from '~/composables/useAuditLogs'

const filters = defineModel<AuditLogFilters>({ required: true })

const teamSlug = computed(() => useRoute().params.teamSlug as string)
const projects = useProjects(teamSlug.value)
const { fetchProjects } = useProjectsService()

onMounted(() => {
  if (!projects.value?.length) fetchProjects()
})

const actionItems = [
  { label: 'All actions', value: undefined },
  ...AUDIT_ACTIONS.map(action => ({ label: action, value: action })),
]

const actorItems = [
  { label: 'All actors', value: undefined },
  { label: 'Users', value: 'user' as AuditActorType },
  { label: 'API tokens', value: 'token' as AuditActorType },
  { label: 'System', value: 'system' as AuditActorType },
]

const projectItems = computed(() => [
  { label: 'All projects', value: undefined },
  ...(projects.value ?? []).map(p => ({ label: p.name, value: p.id })),
])
</script>

<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
    <USelect
      v-model="filters.action"
      :items="actionItems"
      value-key="value"
      placeholder="Action"
      class="w-full sm:w-48"
      size="sm"
    />
    <USelect
      v-model="filters.actorType"
      :items="actorItems"
      value-key="value"
      placeholder="Actor"
      class="w-full sm:w-40"
      size="sm"
    />
    <USelect
      v-model="filters.projectId"
      :items="projectItems"
      value-key="value"
      placeholder="Project"
      class="w-full sm:w-48"
      size="sm"
    />
  </div>
</template>
