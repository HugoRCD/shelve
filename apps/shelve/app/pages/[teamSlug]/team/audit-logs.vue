<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { AuditLog } from '@types'

const route = useRoute()
const teamSlug = computed(() => route.params.teamSlug as string)

const logs = ref<AuditLog[]>([])
const loading = ref(false)
const filterAction = ref('')
const cursor = ref<number | null>(null)
const hasMore = ref(false)

const columns: TableColumn<AuditLog>[] = [
  { accessorKey: 'createdAt', header: 'When' },
  { accessorKey: 'actorType', header: 'Actor' },
  { accessorKey: 'action', header: 'Action' },
  { accessorKey: 'resourceType', header: 'Resource' },
  { accessorKey: 'ip', header: 'IP' },
  { accessorKey: 'userAgent', header: 'User Agent' },
]

async function fetchLogs(reset = false) {
  loading.value = true
  try {
    const query: Record<string, string | number> = { limit: 50 }
    if (filterAction.value) query.action = filterAction.value
    if (!reset && cursor.value) query.cursor = cursor.value
    const res = await $fetch<{ logs: AuditLog[]; nextCursor: number | null }>(
      `/api/teams/${teamSlug.value}/audit-logs`,
      { query }
    )
    logs.value = reset ? res.logs : [...logs.value, ...res.logs]
    cursor.value = res.nextCursor
    hasMore.value = res.nextCursor !== null
  } catch {
    toast.error('Failed to fetch audit logs')
  } finally {
    loading.value = false
  }
}

watch(filterAction, () => {
  cursor.value = null
  fetchLogs(true)
})

fetchLogs(true)

useSeoMeta({ title: 'Audit logs' })
</script>

<template>
  <PageSection
    title="Audit logs"
    description="Every sensitive action across this team — token rotation, secret reads/writes, environment changes."
  >
    <UTable
      :columns
      :data="logs"
      :loading
      :ui="{
        base: 'table-fixed border-separate border-spacing-0',
        thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
        tbody: '[&>tr]:last:[&>td]:border-b-0',
        th: 'first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
        td: 'border-b border-default',
      }"
    >
      <template #createdAt-cell="{ row }">
        <DatePopover :date="row.original.createdAt" label="When" />
      </template>
      <template #actorType-cell="{ row }">
        <UBadge :color="row.original.actorType === 'token' ? 'warning' : 'neutral'" variant="subtle">
          {{ row.original.actorType }}
        </UBadge>
      </template>
      <template #action-cell="{ row }">
        <span class="font-mono text-sm">{{ row.original.action }}</span>
      </template>
      <template #userAgent-cell="{ row }">
        <span class="truncate text-xs text-muted">{{ row.original.userAgent || '—' }}</span>
      </template>
    </UTable>

    <template #actions>
      <UInput v-model="filterAction" size="sm" placeholder="Filter by action (e.g. token.create)" />
      <UButton v-if="hasMore" size="sm" :loading variant="subtle" @click="fetchLogs(false)">
        Load more
      </UButton>
    </template>
  </PageSection>
</template>
