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
    accessorKey: 'token',
    header: 'Token',
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => {
      return new Date(row.getValue('createdAt')).toLocaleString()
    }
  },
  {
    accessorKey: 'updatedAt',
    header: 'Last Used',
    cell: ({ row }) => {
      return new Date(row.getValue('updatedAt')).toLocaleString()
    }
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
          description: `You are about to delete ${row.name} token which is currently ${isTokenActive(row.updatedAt) ? 'active' : 'inactive'}, this action cannot be undone.`,
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

function isTokenActive(value: string) {
  const updatedAt = new Date(value)
  const oneWeekAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
  return updatedAt > oneWeekAgo
}

fetchTokens()
</script>

<template>
  <PageSection
    title="Tokens"
    description="Manage your tokens for the CLI"
    :stagger="1"
  >
    <UTable
      style="--stagger: 2"
      data-animate
      :columns
      :data="filteredTokens"
      :loading
      :ui="{
        base: 'table-fixed border-separate border-spacing-0 mt-6',
        thead: '[&>tr]:bg-(--ui-bg-elevated)/50 [&>tr]:after:content-none',
        tbody: '[&>tr]:last:[&>td]:border-b-0',
        th: 'first:rounded-l-[calc(var(--ui-radius)*2)] last:rounded-r-[calc(var(--ui-radius)*2)] border-y border-(--ui-border) first:border-l last:border-r',
        td: 'border-b border-(--ui-border)'
      }"
    >
      <template #token-cell="{ row }">
        <TokenToggle :token="row.original.token" />
      </template>
      <template #updatedAt-cell="{ row }">
        <span class="flex items-center gap-1">
          {{ row.original.updatedAt }}
          <UTooltip v-if="!isTokenActive( row.original.updatedAt)" text="Token seems to be inactive">
            <div>
              <UIcon name="heroicons-outline:clock" class="size-4 text-red-600" />
            </div>
          </UTooltip>
          <UTooltip v-else text="Token is active">
            <div>
              <UIcon name="heroicons-outline:clock" class="size-4 text-(--ui-text-muted)" />
            </div>
          </UTooltip>
        </span>
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
      <TokenCreate v-model:search="search" @create="fetchTokens" />
      <UInput v-model="search" size="sm" placeholder="Search tokens" />
    </template>
  </PageSection>
</template>
