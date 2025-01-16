<script setup lang="ts">
import { AuthType, Role, type Stats, type User } from '@shelve/types'
import type { TableColumn } from '@nuxt/ui'
import { ConfirmModal } from '#components'

const { data: users, status, refresh } = useFetch<User[]>('/api/admin/users', {
  method: 'GET',
  watch: false,
})

const { stats, isLoading } = useStats()

const statsArray = computed(() => {
  if (isLoading.value) return []
  if (Array.isArray(stats.value)) return stats.value
  return Object.values(stats.value as Stats)
})

const search = ref('')
const updateLoading = ref(false)
const deleteLoading = ref(false)
const filteredUsers = computed(() => {
  // eslint-disable-next-line
  if (!search.value) return users.value?.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  return users.value!.filter((user: User) => user.username.toLowerCase().includes(search.value.toLowerCase()))
})

async function changeUserRole(id: number, role: string) {
  try {
    updateLoading.value = true
    await $fetch(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: {
        role,
      },
    })
    toast.success('User role updated')
    await refresh()
  } catch (error) {
    toast.error('Error updating user role')
  }
  updateLoading.value = false
}

async function deleteUser(id: number) {
  deleteLoading.value = true
  try {
    await $fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
    })
    await refresh()
  } catch (error) { /* empty */ }
  deleteLoading.value = false
}

const columns: TableColumn<User>[] = [
  {
    accessorKey: 'avatar',
    header: 'Avatar',
  },
  {
    accessorKey: 'username',
    header: 'Username',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
  {
    accessorKey: 'authType',
    header: 'Auth',
  },
  {
    accessorKey: 'onboarding',
    header: 'Onboarding',
  },
  {
    accessorKey: 'cliInstalled',
    header: 'CLI',
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => {
      return new Date(row.getValue('createdAt')).toLocaleString()
    }
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated At',
    cell: ({ row }) => {
      return new Date(row.getValue('updatedAt')).toLocaleString()
    }
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
  },
]

const modal = useModal()

const items = (row: User) => [
  [
    {
      label: 'Set as Admin',
      icon: 'heroicons:shield-check-20-solid',
      onSelect: () => {
        if (row.role === Role.ADMIN) {
          toast.success('User is already an admin')
          return
        }
        changeUserRole(row.id, Role.ADMIN)
      },
    },
    {
      label: 'Set as User',
      icon: 'heroicons:user-circle-20-solid',
      onSelect: () => {
        changeUserRole(row.id, Role.USER)
      },
    },
  ],
  [
    {
      label: 'Delete',
      icon: 'heroicons:trash-20-solid',
      iconClass: 'text-red-500 dark:text-red-500',
      onSelect: () => {
        if (row.role === Role.ADMIN) {
          toast.error('Cannot delete admin')
          return
        }
        modal.open(ConfirmModal, {
          title: 'Are you sure?',
          description: `You are about to delete ${row.username ? row.username : row.email}, this action cannot be undone.`,
          danger: true,
          onSuccess() {
            toast.promise(deleteUser(row.id), {
              loading: 'Deleting user...',
              success: 'User has been deleted',
              error: 'Failed to delete user',
            })
          },
        })
      },
    },
  ],
]
</script>

<template>
  <div class="mt-1 flex flex-col gap-4">
    <div class="flex gap-2">
      <UCard v-for="stat in statsArray" :key="stat.label" class="w-full">
        <div class="flex flex-col gap-1 items-center">
          <span class="text-lg font-semibold text-neutral-800 dark:text-neutral-200">{{ stat.value }}</span>
          <span class="text-sm text-neutral-600 dark:text-neutral-400">{{ capitalize(stat.label) }}</span>
        </div>
      </UCard>
    </div>
    <Teleport defer to="#action-items">
      <div class="hidden items-center justify-end gap-2 sm:flex">
        <UInput v-model="search" label="Search" placeholder="Search a user" icon="heroicons:magnifying-glass-20-solid" />
      </div>
    </Teleport>
    <UTable :data="filteredUsers" :columns :loading="status === 'pending' || updateLoading || deleteLoading">
      <template #avatar-cell="{ row }">
        <UAvatar :src="row.original.avatar" :alt="row.original.username" size="sm" img-class="object-cover" />
      </template>
      <template #username-cell="{ row }">
        <NuxtLink v-if="row.original.authType === AuthType.GITHUB" :to="`https://github.com/${row.original.username}`" target="_blank">
          <span class="text-neutral-600 dark:text-neutral-200">
            {{ row.original.username }}
          </span>
        </NuxtLink>
        <span v-else>{{ row.original.username }}</span>
      </template>
      <template #role-cell="{ row }">
        <UBadge :label="row.original.role.toUpperCase()" :color="row.original.role === Role.ADMIN ? 'primary' : 'neutral'" variant="subtle" />
      </template>
      <template #authType-cell="{ row }">
        <UBadge :label="row.original.authType.toUpperCase()" :color="row.original.authType === AuthType.GITHUB ? 'primary' : 'neutral'" variant="subtle" />
      </template>
      <template #onboarding-cell="{ row }">
        <UBadge :label="row.original.onboarding ? 'Yes' : 'No'" :color="row.original.onboarding ? 'success' : 'neutral'" variant="subtle" />
      </template>
      <template #cliInstalled-cell="{ row }">
        <UBadge :label="row.original.cliInstalled ? 'Yes' : 'No'" :color="row.original.cliInstalled ? 'success' : 'neutral'" variant="subtle" />
      </template>
      <template #actions-cell="{ row }">
        <UDropdownMenu :items="items(row.original)">
          <UButton variant="ghost" icon="heroicons:ellipsis-horizontal-20-solid" />
        </UDropdownMenu>
      </template>
    </UTable>
  </div>
</template>
