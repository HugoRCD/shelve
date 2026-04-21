<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { type Token } from '@types'
import { ConfirmModal } from '#components'

const columns: TableColumn<Token>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'prefix',
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
    accessorKey: 'lastUsedAt',
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

const items = (row: Token) => [
  [
    {
      label: 'Delete',
      icon: 'lucide:trash',
      onSelect: () => {
        modal.open({
          title: 'Are you sure?',
          description: `You are about to delete ${row.name} token which is currently ${isTokenActive(row.lastUsedAt) ? 'active' : 'inactive'}, this action cannot be undone.`,
          danger: true,
          onSuccess() {
            toast.promise(deleteToken(row), {
              loading: 'Deleting token...',
              success: 'Token has been deleted',
              error: 'Failed to delete token',
            })
          },
        })
      },
    },
  ],
]

const tokens = ref<Token[]>([])
const search = ref('')
const loading = ref(false)

const filteredTokens = computed(() => {
  if (!search.value) return tokens.value
  return tokens.value!.filter((token: Token) => token.name.toLowerCase().includes(search.value.toLowerCase()))
})

async function fetchTokens() {
  loading.value = true
  try {
    tokens.value = await $fetch<Token[]>('/api/tokens', {
      method: 'GET',
    })
  } catch (error) {
    toast.error('Failed to fetch tokens')
  }
  loading.value = false
}

const overlay = useOverlay()
const modal = overlay.create(ConfirmModal)

async function deleteToken(token: Token) {
  await $fetch(`/api/tokens/${token.id}`, {
    method: 'DELETE',
  })
  await fetchTokens()
}

function isTokenActive(value: string | Date | null) {
  if (!value) return false
  const lastUsedAt = new Date(value)
  const oneWeekAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
  return lastUsedAt > oneWeekAgo
}

fetchTokens()

useSeoMeta({
  title: 'Tokens',
})
</script>

<template>
  <PageSection
    title="Tokens"
    description="Manage your tokens for the CLI"
  >
    <UTable
      :columns
      :data="filteredTokens"
      :loading
      :ui="{
        base: 'table-fixed border-separate border-spacing-0',
        thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
        tbody: '[&>tr]:last:[&>td]:border-b-0',
        th: 'first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
        td: 'border-b border-default'
      }"
    >
      <template #prefix-cell="{ row }">
        <TokenToggle :prefix="row.original.prefix" />
      </template>
      <template #scopes-cell="{ row }">
        <TokenScopes :token="row.original" />
      </template>
      <template #createdAt-cell="{ row }">
        <DatePopover :date="row.original.createdAt" label="Created At" />
      </template>
      <template #lastUsedAt-cell="{ row }">
        <span class="flex items-center gap-1">
          <DatePopover v-if="row.original.lastUsedAt" :date="row.original.lastUsedAt" label="Last Used" />
          <span v-else class="text-sm text-muted">never</span>
          <UTooltip v-if="!isTokenActive(row.original.lastUsedAt)" text="Token seems to be inactive">
            <UIcon name="heroicons-outline:clock" class="size-4 text-red-600" />
          </UTooltip>
          <UTooltip v-else text="Token is active">
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
      <TokenCreate @create="fetchTokens" />
      <UInput v-model="search" size="sm" placeholder="Search tokens" />
    </template>
  </PageSection>
</template>
