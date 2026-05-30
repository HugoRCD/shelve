<script setup lang="ts">
import type { AuditLogEntry } from '@types'

const route = useRoute()
const teamSlug = computed(() => route.params.teamSlug as string)

const {
  logs,
  loading,
  loadingMore,
  hasMore,
  total,
  filters,
  fetchLogs,
} = useAuditLogs(teamSlug)

const selectedEntry = ref<AuditLogEntry | null>(null)
const detailOpen = ref(false)

const hasFilters = computed(() =>
  Boolean(filters.action || filters.actorType || filters.projectId),
)

function openDetail(entry: AuditLogEntry) {
  selectedEntry.value = entry
  detailOpen.value = true
}

useSeoMeta({ title: 'Audit logs' })
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="text-sm text-muted">
      Every sensitive action across this team — token rotation, secret reads/writes, environment changes.
    </p>

    <AuditLogFilters v-model="filters" />

    <AuditLogFeed
      :logs
      :loading
      :has-filters
      @select="openDetail"
    />

    <div class="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
      <p class="text-xs text-muted">
        Showing {{ logs.length }} of {{ total }} event{{ total === 1 ? '' : 's' }}
      </p>
      <UButton
        v-if="hasMore"
        size="sm"
        variant="subtle"
        :loading="loadingMore"
        @click="fetchLogs(false)"
      >
        Load more
      </UButton>
    </div>

    <AuditLogDetail v-model:open="detailOpen" :entry="selectedEntry" />
  </div>
</template>
