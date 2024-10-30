<script setup lang="ts">
import type { Token } from '@shelve/types'

const columns = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
  },
  {
    key: 'token',
    label: 'Token',
    sortable: true,
  },
  {
    key: 'createdAt',
    label: 'Created',
    sortable: true,
  },
  {
    key: 'updatedAt',
    label: 'Last Used',
    sortable: true,
  },
  {
    key: 'actions',
    label: '',
  },
]

const items = (row: Token) => [
  [
    {
      label: 'Delete',
      icon: 'lucide:trash',
      iconClass: 'text-red-500 dark:text-red-500',
      click: () => {
        deleteToken(row)
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
  tokens.value = await $fetch<Token[]>('/api/tokens', {
    method: 'GET',
  })
  loading.value = false
}

async function deleteToken(token: Token) {
  await $fetch(`/api/tokens/${token.id}`, {
    method: 'DELETE',
  })
  toast.success('Token deleted')
  await fetchTokens()
}

function isTokenActive(token: Token) {
  const updatedAt = new Date(token.updatedAt)
  const oneWeekAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
  return updatedAt > oneWeekAgo
}

fetchTokens()
</script>

<template>
  <div class="flex flex-col">
    <div style="--stagger: 1" data-animate class="flex items-center gap-4">
      <div>
        <h2 class="text-base font-semibold leading-7">
          Tokens
        </h2>
        <p class="text-sm leading-6 text-neutral-500">
          Manage your tokens for the CLI
        </p>
      </div>
    </div>
    <Teleport defer to="#action-items">
      <div class="hidden items-center justify-end gap-2 sm:flex">
        <TokenCreate v-model:search="search" @create="fetchTokens" />
        <UInput v-model="search" placeholder="Search tokens" />
      </div>
    </Teleport>
    <div style="--stagger: 2" data-animate class="mt-6">
      <UTable :columns :rows="filteredTokens" :loading :items-per-page="10">
        <template #token-data="{ row }">
          <TokenToggle :token="row.token" />
        </template>
        <template #empty-state>
          <div class="flex flex-col items-center justify-center gap-3 py-6">
            <span class="text-sm italic">No tokens here</span>
            <TokenCreate @create="fetchTokens" />
          </div>
        </template>
        <template #createdAt-data="{ row }">
          {{ new Date(row.createdAt).toLocaleString() }}
        </template>
        <template #updatedAt-data="{ row }">
          <span class="flex items-center gap-1">
            {{ new Date(row.updatedAt).toLocaleString() }}
            <UTooltip v-if="!isTokenActive(row)" text="Token seems to be inactive">
              <UIcon name="heroicons-outline:clock" class="size-4 text-red-600" />
            </UTooltip>
            <UTooltip v-else text="Token is active">
              <UIcon name="heroicons-outline:clock" class="size-4 text-neutral-500" />
            </UTooltip>
          </span>
        </template>
        <template #actions-data="{ row }">
          <UDropdown :items="items(row)">
            <UButton
              color="neutral"
              variant="ghost"
              icon="heroicons:ellipsis-horizontal-20-solid"
            />
          </UDropdown>
        </template>
      </UTable>
    </div>
  </div>
</template>

<style scoped>

</style>
