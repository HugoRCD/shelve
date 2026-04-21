<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { AuditLog, AuditActorType } from '@types'
import { parseUserAgent } from '~/utils/userAgent'

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
  { accessorKey: 'userAgent', header: 'Client' },
  { accessorKey: 'metadata', header: '' },
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

const actorMeta: Record<AuditActorType, { color: 'warning' | 'neutral' | 'info'; icon: string }> = {
  token: { color: 'warning', icon: 'lucide:key-round' },
  user: { color: 'neutral', icon: 'lucide:user-round' },
  system: { color: 'info', icon: 'lucide:cpu' },
}

type ActionColor = 'success' | 'error' | 'warning' | 'info' | 'neutral'

function actionColor(action: string): ActionColor {
  if (action.endsWith('.create') || action.endsWith('.invite')) return 'success'
  if (action.endsWith('.delete') || action.endsWith('.remove')) return 'error'
  if (action.endsWith('.update') || action.startsWith('token.')) return 'warning'
  if (action.startsWith('auth.')) return 'info'
  return 'neutral'
}

const resourceIcons: Record<string, string> = {
  variable: 'lucide:variable',
  variables: 'lucide:variable',
  environment: 'lucide:layers',
  project: 'lucide:folder',
  team: 'lucide:users',
  token: 'lucide:key-round',
  user: 'lucide:user-round',
}

function resourceIcon(type: string | null) {
  if (!type) return 'lucide:circle-dashed'
  return resourceIcons[type.toLowerCase()] ?? 'lucide:circle'
}

function hasMetadata(log: AuditLog) {
  return log.metadata && Object.keys(log.metadata).length > 0
}

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
        base: 'w-full border-separate border-spacing-0',
        thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
        tbody: '[&>tr]:last:[&>td]:border-b-0',
        th: 'first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r text-xs font-medium uppercase tracking-wide text-muted',
        td: 'border-b border-default py-2.5 align-middle',
      }"
    >
      <template #createdAt-cell="{ row }">
        <DatePopover :date="row.original.createdAt" label="When" />
      </template>

      <template #actorType-cell="{ row }">
        <UBadge
          :color="actorMeta[row.original.actorType as AuditActorType]?.color ?? 'neutral'"
          variant="subtle"
          size="sm"
          :icon="actorMeta[row.original.actorType as AuditActorType]?.icon"
          class="font-medium"
        >
          {{ row.original.actorType }}
        </UBadge>
      </template>

      <template #action-cell="{ row }">
        <UBadge
          :color="actionColor(row.original.action)"
          variant="soft"
          size="sm"
          class="font-mono text-xs"
        >
          {{ row.original.action }}
        </UBadge>
      </template>

      <template #resourceType-cell="{ row }">
        <div v-if="row.original.resourceType" class="flex items-center gap-1.5 text-sm">
          <UIcon :name="resourceIcon(row.original.resourceType)" class="size-4 text-muted" />
          <span>{{ row.original.resourceType }}</span>
          <span v-if="row.original.resourceId" class="text-xs text-muted font-mono">
            #{{ row.original.resourceId }}
          </span>
        </div>
        <span v-else class="text-sm text-muted">—</span>
      </template>

      <template #ip-cell="{ row }">
        <span v-if="row.original.ip" class="font-mono text-xs text-muted bg-elevated/40 rounded px-1.5 py-0.5">
          {{ row.original.ip }}
        </span>
        <span v-else class="text-sm text-muted">—</span>
      </template>

      <template #userAgent-cell="{ row }">
        <UTooltip
          v-if="row.original.userAgent"
          :text="row.original.userAgent"
          :delay-duration="100"
          :content="{ side: 'top', align: 'start' }"
        >
          <span class="inline-flex items-center gap-1.5 text-sm text-muted">
            <UIcon :name="parseUserAgent(row.original.userAgent)?.icon ?? 'lucide:globe'" class="size-3.5" />
            <span class="truncate max-w-40">{{ parseUserAgent(row.original.userAgent)?.label ?? row.original.userAgent }}</span>
          </span>
        </UTooltip>
        <span v-else class="text-sm text-muted">—</span>
      </template>

      <template #metadata-cell="{ row }">
        <UPopover v-if="hasMetadata(row.original)" arrow :content="{ side: 'left' }">
          <UButton
            icon="lucide:braces"
            color="neutral"
            variant="ghost"
            size="xs"
            aria-label="View metadata"
          />
          <template #content>
            <div class="max-w-sm p-3">
              <p class="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                Metadata
              </p>
              <pre class="max-h-72 overflow-auto rounded-md bg-elevated/40 p-2 text-xs font-mono whitespace-pre-wrap break-all">{{ JSON.stringify(row.original.metadata, null, 2) }}</pre>
            </div>
          </template>
        </UPopover>
      </template>

      <template #empty>
        <div class="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <UIcon name="lucide:scroll-text" class="size-8 text-muted" />
          <p class="text-sm font-medium">
            No audit logs yet
          </p>
          <p class="text-xs text-muted">
            {{ filterAction ? 'Try clearing the filter.' : 'Sensitive actions will appear here as they happen.' }}
          </p>
        </div>
      </template>
    </UTable>

    <div v-if="hasMore" class="mt-4 flex justify-center">
      <UButton size="sm" :loading variant="subtle" @click="fetchLogs(false)">
        Load more
      </UButton>
    </div>

    <template #actions>
      <UInput
        v-model="filterAction"
        size="sm"
        icon="lucide:filter"
        placeholder="Filter by action (e.g. token.create)"
      />
    </template>
  </PageSection>
</template>
