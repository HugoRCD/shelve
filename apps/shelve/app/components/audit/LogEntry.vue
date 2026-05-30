<script setup lang="ts">
import type { AuditLogEntry } from '@types'

defineProps<{
  entry: AuditLogEntry
}>()

defineEmits<{
  select: []
}>()
</script>

<template>
  <button
    type="button"
    class="group flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-elevated/50"
    @click="$emit('select')"
  >
    <div
      class="flex size-8 shrink-0 items-center justify-center rounded-md bg-elevated/60"
    >
      <UIcon :name="entry.actionIcon" class="size-4" :class="entry.actionColor" />
    </div>

    <div class="min-w-0 flex-1">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="flex items-center gap-2 text-sm">
            <UAvatar
              v-if="entry.actor.type === 'user' && entry.actor.avatarUrl"
              :src="entry.actor.avatarUrl"
              :alt="entry.actor.label"
              size="2xs"
            />
            <UIcon
              v-else-if="entry.actor.type === 'token'"
              name="lucide:key-round"
              class="size-3.5 text-muted"
            />
            <span class="font-medium truncate">{{ entry.actor.label }}</span>
            <span class="text-muted shrink-0">·</span>
            <span class="text-xs text-muted capitalize">{{ entry.actor.type }}</span>
          </div>
          <p class="mt-0.5 text-sm text-default">
            {{ entry.summary }}
          </p>
          <div class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted">
            <NuxtLink
              v-if="entry.resource?.href"
              :to="entry.resource.href"
              class="hover:text-default hover:underline"
              @click.stop
            >
              {{ entry.resource.label }}
            </NuxtLink>
            <span v-else-if="entry.resource">{{ entry.resource.label }}</span>
            <template v-if="entry.ip">
              <span>·</span>
              <span class="font-mono">{{ entry.ip }}</span>
            </template>
            <template v-if="entry.client.raw">
              <span>·</span>
              <span class="inline-flex items-center gap-1">
                <UIcon :name="entry.client.icon" class="size-3" />
                {{ entry.client.label }}
              </span>
            </template>
          </div>
        </div>
        <div class="flex shrink-0 items-center gap-2 pt-0.5">
          <DatePopover :date="entry.createdAt" label="When" />
          <UIcon
            name="lucide:chevron-right"
            class="size-4 text-muted opacity-0 transition-opacity group-hover:opacity-100"
          />
        </div>
      </div>
    </div>
  </button>
</template>
