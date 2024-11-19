<script setup lang="ts">
import type { Member } from '@shelve/types'
import { TeamRole } from '@shelve/types'
import type { TableColumn } from '@nuxt/ui'
import { ConfirmModal } from '#components'

const currentTeam = useDefaultTeam()
const teamId = ref(currentTeam.value.id)

const { data: members, status, refresh } = useFetch<Member[]>(`/api/teams/${teamId.value}/members`, {
  method: 'GET',
  watch: false,
})

const {
  updateMember
} = useTeams()

const search = ref('')
const updateLoading = ref(false)
const deleteLoading = ref(false)

const filteredMembers = computed(() => {
  // eslint-disable-next-line
  if (!search.value) return members.value?.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  return members.value!.filter((member: Member) => member.user.username?.toLowerCase().includes(search.value.toLowerCase()) || member.user.email.toLowerCase().includes(search.value.toLowerCase()))
})

async function changeMemberRole(memberId: number, role: TeamRole) {
  try {
    updateLoading.value = true
    await updateMember(memberId, role)
    await refresh()
  } catch (error) {
    toast.error('Error updating member role')
  }
  updateLoading.value = false
}

async function deleteMember(id: number) {
  deleteLoading.value = true
  try {
    await $fetch(`/api/teams/${teamId.value}/members/${id}`, {
      method: 'DELETE',
    })
    await refresh()
  } catch (error) { /* empty */ }
  deleteLoading.value = false
}

const columns: TableColumn<Member>[] = [
  {
    accessorKey: 'avatar',
    header: 'Avatar',
  },
  {
    accessorKey: 'user.username',
    header: 'Username',
  },
  {
    accessorKey: 'user.email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
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

const items = (row: Member) => [
  [
    {
      label: 'Set as Owner',
      icon: 'lucide:crown',
      onSelect: () => {
        if (row.role === TeamRole.OWNER) {
          toast.success('User is already an owner')
          return
        }
        changeMemberRole(row.id, TeamRole.OWNER)
      },
    },
    {
      label: 'Set as Admin',
      icon: 'lucide:shield',
      onSelect: () => {
        if (row.role === TeamRole.ADMIN) {
          toast.success('User is already an admin')
          return
        }
        changeMemberRole(row.id, TeamRole.ADMIN)
      },
    },
    {
      label: 'Set as Member',
      icon: 'lucide:user',
      onSelect: () => {
        changeMemberRole(row.id, TeamRole.MEMBER)
      },
    },
  ],
  [
    {
      label: 'Delete',
      icon: 'heroicons:trash-20-solid',
      iconClass: 'text-red-500 dark:text-red-500',
      onSelect: () => {
        if (row.role === TeamRole.OWNER) {
          toast.error('Cannot delete team owner')
          return
        }
        modal.open(ConfirmModal, {
          title: 'Are you sure?',
          description: `You are about to remove ${row.user.username} from the team.`,
          danger: true,
          onSuccess() {
            toast.promise(deleteMember(row.id), {
              loading: 'Removing member...',
              success: 'Member removed successfully',
              error: 'Error removing member',
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
    <Teleport defer to="#action-items">
      <TeamAddMember v-if="members" :members />
    </Teleport>
    <div class="flex flex-col justify-end gap-4 sm:flex-row sm:items-center">
      <UInput v-model="search" label="Search" placeholder="Search a user" icon="heroicons:magnifying-glass-20-solid" />
    </div>
    <UTable :data="filteredMembers" :columns :loading="status === 'pending' || updateLoading || deleteLoading">
      <template #avatar-cell="{ row }">
        <UAvatar :src="row.original.user.avatar" :alt="row.original.user.username" size="sm" img-class="object-cover" />
      </template>
      <template #role-cell="{ row }">
        <UBadge :label="row.original.role.toUpperCase()" variant="subtle" :color="row.original.role === TeamRole.OWNER ? 'primary' : row.original.role === TeamRole.ADMIN ? 'success' : 'neutral'" />
      </template>
      <template #actions-cell="{ row }">
        <UDropdownMenu :items="items(row.original)">
          <UButton color="neutral" variant="ghost" icon="heroicons:ellipsis-horizontal-20-solid" />
        </UDropdownMenu>
      </template>
    </UTable>
  </div>
</template>
