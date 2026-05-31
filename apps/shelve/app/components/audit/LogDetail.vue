<script setup lang="ts">
import type { AuditLogEntry } from '@types'

const props = defineProps<{
  entry: AuditLogEntry | null
}>()

const open = defineModel<boolean>('open', { default: false })

const hasMetadata = computed(() => {
  const meta = props.entry?.metadata
  return meta && Object.keys(meta).length > 0
})

const showRawMetadata = ref(false)

watch(() => props.entry?.id, () => {
  showRawMetadata.value = false
})
</script>

<template>
  <UDrawer
    v-model:open="open"
    direction="right"
    :title="entry?.summary ?? 'Audit log details'"
    description="Full context for this event"
  >
    <template #body>
      <div v-if="entry" class="flex flex-col gap-5 p-4">
        <section>
          <h3 class="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            What happened
          </h3>
          <p class="text-sm">
            {{ entry.summary }}
          </p>
          <p class="mt-1 font-mono text-xs text-muted">
            {{ entry.action }}
          </p>
        </section>

        <section>
          <h3 class="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            Who
          </h3>
          <div class="flex items-center gap-2">
            <UAvatar
              v-if="entry.actor.type === 'user' && entry.actor.avatarUrl"
              :src="entry.actor.avatarUrl"
              :alt="entry.actor.label"
              size="sm"
            />
            <UIcon
              v-else-if="entry.actor.type === 'token'"
              name="lucide:key-round"
              class="size-5 text-muted"
            />
            <UIcon
              v-else
              name="lucide:cpu"
              class="size-5 text-muted"
            />
            <div>
              <p class="text-sm font-medium">
                {{ entry.actor.label }}
              </p>
              <p class="text-xs text-muted capitalize">
                {{ entry.actor.type }}
              </p>
            </div>
          </div>
        </section>

        <section v-if="entry.resource">
          <h3 class="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            Where
          </h3>
          <NuxtLink
            v-if="entry.resource.href"
            :to="entry.resource.href"
            class="text-sm text-primary hover:underline"
          >
            {{ entry.resource.label }}
          </NuxtLink>
          <p v-else class="text-sm">
            {{ entry.resource.label }}
          </p>
        </section>

        <section>
          <h3 class="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            Context
          </h3>
          <dl class="space-y-2 text-sm">
            <div class="flex justify-between gap-4">
              <dt class="text-muted">
                When
              </dt>
              <dd class="text-right">
                <DatePopover :date="entry.createdAt" label="When" />
              </dd>
            </div>
            <div v-if="entry.ip" class="flex justify-between gap-4">
              <dt class="text-muted">
                IP
              </dt>
              <dd class="font-mono text-xs">
                {{ entry.ip }}
              </dd>
            </div>
            <div v-if="entry.client.raw" class="flex justify-between gap-4">
              <dt class="text-muted">
                Client
              </dt>
              <dd class="flex items-center gap-1.5 text-xs">
                <UIcon :name="entry.client.icon" class="size-3.5" />
                {{ entry.client.label }}
              </dd>
            </div>
          </dl>
        </section>

        <section v-if="hasMetadata">
          <button
            type="button"
            class="flex w-full items-center justify-between text-xs font-medium uppercase tracking-wide text-muted"
            @click="showRawMetadata = !showRawMetadata"
          >
            Raw metadata
            <UIcon
              :name="showRawMetadata ? 'lucide:chevron-up' : 'lucide:chevron-down'"
              class="size-4"
            />
          </button>
          <pre
            v-if="showRawMetadata"
            class="mt-2 max-h-48 overflow-auto rounded-md bg-elevated/40 p-2 text-xs font-mono whitespace-pre-wrap break-all"
          >{{ JSON.stringify(entry.metadata, null, 2) }}</pre>
        </section>
      </div>
    </template>
  </UDrawer>
</template>
