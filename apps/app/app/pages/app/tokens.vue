<script setup lang="ts">
import type { CliToken } from '@shelve/types'

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

const items = (row: CliToken) => [
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

const tokens = ref<CliToken[]>([])
const search = ref('')
const loading = ref(false)

const filteredTokens = computed(() => {
  if (!search.value) return tokens.value
  return tokens.value!.filter((token: CliToken) => token.name.toLowerCase().includes(search.value.toLowerCase()))
})

async function fetchTokens() {
  loading.value = true
  tokens.value = await $fetch<CliToken[]>('/api/tokens', {
    method: 'GET',
  })
  loading.value = false
}

async function deleteToken(token: CliToken) {
  await $fetch(`/api/tokens/${token.id}`, {
    method: 'DELETE',
  })
  toast.success('Token deleted')
  await fetchTokens()
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
        <p class="text-sm leading-6 text-gray-500">
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
          {{ new Date(row.updatedAt).toLocaleString() }}
        </template>
        <template #actions-data="{ row }">
          <UDropdown :items="items(row)">
            <UButton
              color="gray"
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
