<script setup lang="ts">
import type { AuditLogEntry } from '@types'

defineProps<{
  logs: AuditLogEntry[]
  loading: boolean
  hasFilters: boolean
}>()

defineEmits<{
  select: [entry: AuditLogEntry]
}>()
</script>

<template>
  <div class="rounded-lg border border-default overflow-hidden">
    <div v-if="loading && !logs.length" class="flex items-center justify-center py-16">
      <UIcon name="lucide:loader-circle" class="size-6 animate-spin text-muted" />
    </div>

    <div v-else-if="!logs.length" class="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <UIcon name="lucide:scroll-text" class="size-8 text-muted" />
      <p class="text-sm font-medium">
        No audit logs yet
      </p>
      <p class="text-xs text-muted">
        {{ hasFilters ? 'Try adjusting your filters.' : 'Sensitive actions will appear here as they happen.' }}
      </p>
    </div>

    <ul v-else class="divide-y divide-default">
      <li v-for="entry in logs" :key="entry.id">
        <AuditLogEntry :entry @select="$emit('select', entry)" />
      </li>
    </ul>
  </div>
</template>
