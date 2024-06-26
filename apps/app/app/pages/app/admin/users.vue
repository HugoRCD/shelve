<script setup lang="ts">
import type { publicUser } from '@shelve/types'
import { Role } from '@shelve/types'

const { data: users, status, refresh } = useFetch<publicUser[]>('/api/admin/users', {
  method: 'GET',
  watch: false,
})

const search = ref('')
const updateLoading = ref(false)
const deleteLoading = ref(false)

const filteredUsers = computed(() => {
  if (!search.value) return users.value
  return users.value!.filter((user: publicUser) => user.username.toLowerCase().includes(search.value.toLowerCase()))
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
    toast.success('User deleted')
    await refresh()
  } catch (error) {
    toast.error('Error deleting user')
  }
  deleteLoading.value = false
}

const columns = [
  {
    key: 'avatar',
    label: 'Avatar',
  },
  {
    key: 'username',
    label: 'Username',
    sortable: true,
  },
  {
    key: 'email',
    label: 'Email',
    sortable: true,
  },
  {
    key: 'role',
    label: 'Role',
  },
  {
    key: 'createdAt',
    label: 'Created At',
    sortable: true,
  },
  {
    key: 'updatedAt',
    label: 'Updated At',
    sortable: true,
  },
  {
    key: 'actions',
    label: 'Actions',
  },
]

const items = (row: publicUser) => [
  [
    {
      label: 'Set as Admin',
      icon: 'i-heroicons-shield-check-20-solid',
      click: () => {
        if (row.role === Role.ADMIN) {
          toast.success('User is already an admin')
          return
        }
        changeUserRole(row.id, Role.ADMIN)
      },
    },
    {
      label: 'Set as User',
      icon: 'i-heroicons-user-circle-20-solid',
      click: () => {
        changeUserRole(row.id, Role.USER)
      },
    },
  ],
  [
    {
      label: 'Delete',
      icon: 'i-heroicons-trash-20-solid',
      iconClass: 'text-red-500 dark:text-red-500',
      click: () => {
        if (row.role === Role.ADMIN) {
          toast.error('Cannot delete admin')
          return
        }
        deleteUser(row.id)
      },
    },
  ],
]

// Selected Columns
const selectedColumns = ref(columns)
const columnsTable = computed(() => columns.filter((column) => selectedColumns.value.includes(column)))
</script>

<template>
  <div class="mt-1 flex flex-col gap-4">
    <div class="flex flex-col justify-end gap-4 sm:flex-row sm:items-center">
      <UInput v-model="search" label="Search" placeholder="Search a user" icon="i-heroicons-magnifying-glass-20-solid" />
      <USelectMenu v-model="selectedColumns" :options="columns" multiple>
        <UButton icon="i-heroicons-view-columns" color="gray" class="w-full sm:w-40">
          Columns
        </UButton>
      </USelectMenu>
    </div>
    <UTable v-if="users" :rows="filteredUsers" :columns="columnsTable" :loading="status === 'pending' || updateLoading || deleteLoading">
      <template #avatar-data="{ row }">
        <UAvatar :src="row.avatar" :alt="row.name" size="sm" img-class="object-cover" />
      </template>
      <template #role-data="{ row }">
        <UBadge :label="row.role.toUpperCase()" :color="row.role === 'admin' ? 'primary' : 'gray'" />
      </template>
      <template #createdAt-data="{ row }">
        <span class="text-sm text-gray-500 dark:text-gray-400">
          {{ new Date(row.createdAt).toLocaleString() }}
        </span>
      </template>
      <template #updatedAt-data="{ row }">
        <span class="text-sm text-gray-500 dark:text-gray-400">
          {{ new Date(row.updatedAt).toLocaleString() }}
        </span>
      </template>
      <template #actions-data="{ row }">
        <UDropdown :items="items(row)">
          <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
        </UDropdown>
      </template>
    </UTable>
  </div>
</template>

<style scoped>

</style>
