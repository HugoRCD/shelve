<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { type ApiKey } from '@types'
import { ConfirmModal } from '#components'

const columns: TableColumn<ApiKey>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'start',
    header: 'Prefix',
  },
  {
    accessorKey: 'scopes',
    header: 'Scopes',
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
  },
  {
    accessorKey: 'lastRequest',
    header: 'Last Used',
  },
  {
    accessorKey: 'expiresAt',
    header: 'Expires',
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
  },
]

const items = (row: ApiKey) => [
  [
    {
      label: 'Delete',
      icon: 'lucide:trash',
      onSelect: () => {
        modal.open({
          title: 'Are you sure?',
          description: `You are about to delete ${row.name} API key which is currently ${isApiKeyActive(row.lastRequest) ? 'active' : 'inactive'}, this action cannot be undone.`,
          danger: true,
          onSuccess() {
            toast.promise(deleteApiKey(row), {
              loading: 'Deleting API key...',
              success: 'API key has been deleted',
              error: 'Failed to delete API key',
            })
          },
        })
      },
    },
  ],
]

const apiKeys = ref<ApiKey[]>([])
const search = ref('')
const loading = ref(false)

const filteredApiKeys = computed(() => {
  if (!search.value) return apiKeys.value
  return apiKeys.value!.filter((apiKey: ApiKey) => apiKey.name.toLowerCase().includes(search.value.toLowerCase()))
})

async function fetchApiKeys() {
  loading.value = true
  try {
    apiKeys.value = await $fetch<ApiKey[]>('/api/api-keys', {
      method: 'GET',
    })
  } catch (error) {
    toast.error('Failed to fetch API keys')
  }
  loading.value = false
}

const overlay = useOverlay()
const modal = overlay.create(ConfirmModal)

async function deleteApiKey(apiKey: ApiKey) {
  await $fetch(`/api/api-keys/${apiKey.id}`, {
    method: 'DELETE',
  })
  await fetchApiKeys()
}

function isApiKeyActive(value: string | Date | null) {
  if (!value) return false
  const lastRequest = new Date(value)
  const oneWeekAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
  return lastRequest > oneWeekAgo
}

fetchApiKeys()

useSeoMeta({
  title: 'API Keys',
})
</script>

<template>
  <PageSection
    title="API Keys"
    description="Manage your API keys for the CLI and CI"
  >
    <UTable
      :columns
      :data="filteredApiKeys"
      :loading
      :ui="{
        base: 'table-fixed border-separate border-spacing-0',
        thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
        tbody: '[&>tr]:last:[&>td]:border-b-0',
        th: 'first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
        td: 'border-b border-default'
      }"
    >
      <template #start-cell="{ row }">
        <ApiKeyToggle :start="row.original.start" />
      </template>
      <template #scopes-cell="{ row }">
        <ApiKeyScopes :api-key="row.original" />
      </template>
      <template #createdAt-cell="{ row }">
        <DatePopover :date="row.original.createdAt" label="Created At" />
      </template>
      <template #lastRequest-cell="{ row }">
        <span class="flex items-center gap-1">
          <DatePopover v-if="row.original.lastRequest" :date="row.original.lastRequest" label="Last Used" />
          <span v-else class="text-sm text-muted">never</span>
          <UTooltip v-if="!isApiKeyActive(row.original.lastRequest)" text="API key seems to be inactive">
            <UIcon name="heroicons-outline:clock" class="size-4 text-red-600" />
          </UTooltip>
          <UTooltip v-else text="API key is active">
            <UIcon name="heroicons-outline:clock" class="size-4 text-muted" />
          </UTooltip>
        </span>
      </template>
      <template #expiresAt-cell="{ row }">
        <DatePopover v-if="row.original.expiresAt" :date="row.original.expiresAt" label="Expires" />
        <span v-else class="text-sm text-muted">never</span>
      </template>
      <template #actions-cell="{ row }">
        <UDropdownMenu :items="items(row.original)">
          <UButton
            variant="ghost"
            icon="heroicons:ellipsis-horizontal-20-solid"
          />
        </UDropdownMenu>
      </template>
    </UTable>

    <template #actions>
      <ApiKeyCreate @create="fetchApiKeys" />
      <UInput v-model="search" size="sm" placeholder="Search API keys" />
    </template>
  </PageSection>
</template>
