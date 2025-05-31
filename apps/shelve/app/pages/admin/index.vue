<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import { getPaginationRowModel } from '@tanstack/vue-table'
import type { TableColumn } from '@nuxt/ui'
import { AuthType, Role, type User } from '@types'
import { ConfirmModal } from '#components'

const { data: users, status, refresh } = useFetch<User[]>('/api/admin/users', {
  method: 'GET',
  watch: false,
})

async function deleteCache() {
  try {
    await $fetch('/api/admin/cache', {
      method: 'DELETE'
    })
    toast.success('Cache deleted')
  } catch (error) {
    toast.error('Cache deletion failed')
  }
}

const search = ref()
const table = useTemplateRef('table')
const updateLoading = ref(false)
const deleteLoading = ref(false)

// eslint-disable-next-line @typescript-eslint/naming-convention
const UButton = resolveComponent('UButton')

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
    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Created At',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    },
    cell: ({ row }) => {
      return new Date(row.getValue('createdAt')).toLocaleString()
    }
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Updated At',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    },
    cell: ({ row }) => {
      return new Date(row.getValue('updatedAt')).toLocaleString()
    }
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
  },
]

const overlay = useOverlay()
const modal = overlay.create(ConfirmModal)

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
      color: 'error',
      onSelect: () => {
        if (row.role === Role.ADMIN) {
          toast.error('Cannot delete admin')
          return
        }
        modal.open({
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

const pagination = ref({
  pageIndex: 0,
  pageSize: 20
})

const sorting = ref([
  {
    id: 'createdAt',
    desc: true,
  }
])
</script>

<template>
  <PageSection
    title="Stats"
    description="All applications stats"
  >
    <AdminStats />
  </PageSection>
  <USeparator class="my-4" />
  <PageSection
    title="Admin"
    description="Manage users and their roles"
  >
    <UTable
      ref="table"
      v-model:pagination="pagination"
      v-model:global-filter="search"
      v-model:sorting="sorting"
      :data="users"
      :columns
      :loading="status === 'pending' || updateLoading || deleteLoading"
      :pagination-options="{
        getPaginationRowModel: getPaginationRowModel()
      }"
      :ui="{
        base: 'table-fixed border-separate border-spacing-0',
        thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
        tbody: '[&>tr]:last:[&>td]:border-b-0',
        th: 'first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
        td: 'border-b border-default'
      }"
    >
      <template #avatar-cell="{ row }">
        <UAvatar :src="row.original.avatar" :alt="row.original.username" size="sm" img-class="object-cover" />
      </template>
      <template #username-cell="{ row }">
        <ULink v-if="row.original.authType === AuthType.GITHUB" :to="`https://github.com/${row.original.username}`" target="_blank">
          <span class="text-highlighted">
            {{ row.original.username }}
          </span>
        </ULink>
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
    <div class="flex justify-center pt-4">
      <UPagination
        :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
        :items-per-page="table?.tableApi?.getState().pagination.pageSize"
        :total="table?.tableApi?.getFilteredRowModel().rows.length"
        @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
      />
    </div>

    <template #actions>
      <UTooltip text="Delete cache">
        <UButton variant="ghost" size="sm" icon="i-lucide-trash" loading-auto @click="deleteCache" />
      </UTooltip>
      <UInput v-model="search" size="sm" label="Search" placeholder="Search a user" icon="heroicons:magnifying-glass-20-solid" />
    </template>
  </PageSection>
</template>
