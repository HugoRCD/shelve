<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import { getPaginationRowModel } from '@tanstack/vue-table'
import type { TableColumn } from '@nuxt/ui'
import type { Member, TeamInvitation } from '@types'
import { TeamRole } from '@types'
import { ConfirmModal } from '#components'

const { updateMember, removeMember, fetchPendingInvitations, cancelInvitation } = useTeamsService()

const currentTeam = useTeam()
const teamRole = useTeamRole()

const pendingInvitations = ref<TeamInvitation[]>([])
const loadingInvitations = ref(false)
const cancellingInvitation = ref<number | null>(null)

async function loadPendingInvitations() {
  if (!hasAccess(teamRole.value, TeamRole.ADMIN)) return
  loadingInvitations.value = true
  try {
    pendingInvitations.value = await fetchPendingInvitations()
  } catch (error) {
    console.error('Failed to fetch pending invitations', error)
  } finally {
    loadingInvitations.value = false
  }
}

async function handleCancelInvitation(invitation: TeamInvitation) {
  cancellingInvitation.value = invitation.id
  try {
    await cancelInvitation(invitation.id)
    pendingInvitations.value = pendingInvitations.value.filter(i => i.id !== invitation.id)
    toast.success('Invitation cancelled')
  } catch (error: any) {
    toast.error(error.data?.message || 'Failed to cancel invitation')
  } finally {
    cancellingInvitation.value = null
  }
}

function handleInvitationSent() {
  loadPendingInvitations()
}

onMounted(() => {
  loadPendingInvitations()
})

// Members logic
const members = computed(() => currentTeam.value?.members.filter((member) => member.user.name.toLowerCase().includes(search.value.toLowerCase())))
const canDelete = computed(() => hasAccess(teamRole.value, TeamRole.OWNER))
const canUpdate = computed(() => hasAccess(teamRole.value, TeamRole.ADMIN))

const search = ref('')
const table = useTemplateRef('table')
const updateLoading = ref(false)

// eslint-disable-next-line @typescript-eslint/naming-convention
const UButton = resolveComponent('UButton')

function changeMemberRole(memberId: number, role: TeamRole) {
  updateLoading.value = true
  toast.promise(updateMember(memberId, role), {
    loading: 'Updating member role...',
    success: 'Member role updated successfully',
    error: 'Error updating member role',
  })
  updateLoading.value = false
}

const overlay = useOverlay()
const modal = overlay.create(ConfirmModal)

const columns: TableColumn<Member>[] = [
  {
    accessorKey: 'image',
    header: 'Avatar',
  },
  {
    accessorKey: 'name',
    header: 'Name',
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
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
  },
]

const items = (row: Member) => [
  [
    {
      label: 'Set as Owner',
      icon: 'lucide:crown',
      disabled: row.role === TeamRole.OWNER || !hasAccess(teamRole.value, TeamRole.OWNER),
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
      disabled: row.role === TeamRole.ADMIN || !hasAccess(teamRole.value, TeamRole.ADMIN),
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
      disabled: row.role === TeamRole.MEMBER || !hasAccess(teamRole.value, TeamRole.ADMIN),
      onSelect: () => {
        changeMemberRole(row.id, TeamRole.MEMBER)
      },
    },
  ],
  [
    {
      label: 'Delete',
      icon: 'heroicons:trash-20-solid',
      color: 'error' as const,
      disabled: !canDelete.value,
      onSelect: () => {
        if (row.role === TeamRole.OWNER) {
          toast.error('Cannot delete team owner')
          return
        }
        modal.open({
          title: 'Are you sure?',
          description: `You are about to remove ${row.user.name} from the team.`,
          danger: true,
          onSuccess() {
            toast.promise(removeMember(row.id), {
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

useSeoMeta({
  title: 'Members',
})

definePageMeta({
  title: 'Members',
})
</script>

<template>
  <div class="space-y-6">
    <div v-if="canUpdate && pendingInvitations.length > 0" class="space-y-3">
      <div class="flex items-center gap-2">
        <h3 class="text-sm font-medium text-highlighted">
          Pending Invitations
        </h3>
        <UBadge :label="String(pendingInvitations.length)" size="xs" variant="subtle" />
      </div>
      <div class="grid gap-2">
        <div
          v-for="invitation in pendingInvitations"
          :key="invitation.id"
          class="flex items-center justify-between p-3 rounded-lg border border-default bg-elevated/50"
        >
          <div class="flex items-center gap-3">
            <UIcon name="heroicons:envelope" class="size-5 text-muted" />
            <div>
              <p class="text-sm font-medium text-highlighted">
                {{ invitation.email }}
              </p>
              <p class="text-xs text-muted">
                Invited as
                <UBadge
                  :label="invitation.role.toUpperCase()"
                  :color="invitation.role === TeamRole.OWNER ? 'primary' : invitation.role === TeamRole.ADMIN ? 'success' : 'neutral'"
                  variant="subtle"
                  size="xs"
                  class="ml-1"
                />
                <span v-if="invitation.invitedBy" class="ml-1">
                  by {{ invitation.invitedBy.username }}
                </span>
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-muted">
              Expires {{ new Date(invitation.expiresAt).toLocaleDateString() }}
            </span>
            <UButton
              size="xs"
              variant="ghost"
              color="error"
              icon="heroicons:x-mark"
              :loading="cancellingInvitation === invitation.id"
              @click="handleCancelInvitation(invitation)"
            />
          </div>
        </div>
      </div>
    </div>

    <UTable
      ref="table"
      v-model:pagination="pagination"
      v-model:global-filter="search"
      v-model:sorting="sorting"
      :data="members"
      :columns
      :loading="updateLoading"
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
      <template #image-cell="{ row }">
        <UAvatar :src="row.original.user.image" :alt="row.original.user.name" size="sm" img-class="object-cover" />
      </template>
      <template #name-cell="{ row }">
        <span class="font-semibold">
          {{ row.original.user.name }}
        </span>
      </template>
      <template #email-cell="{ row }">
        <span class="text-muted hover:text-highlighted cursor-pointer" @click="copyToClipboard(row.original.user.email)">
          {{ row.original.user.email }}
        </span>
      </template>
      <template #role-cell="{ row }">
        <UBadge
          :label="row.original.role.toUpperCase()"
          :color="row.original.role === TeamRole.OWNER ? 'primary' : row.original.role === TeamRole.ADMIN ? 'success' : 'neutral'"
          variant="subtle"
        />
      </template>
      <template #createdAt-cell="{ row }">
        <DatePopover :date="row.original.createdAt" label="Created At" />
      </template>
      <template #updatedAt-cell="{ row }">
        <DatePopover :date="row.original.updatedAt" label="Updated At" />
      </template>
      <template #actions-cell="{ row }">
        <UDropdownMenu v-if="canUpdate && row.original.role !== TeamRole.OWNER" :items="items(row.original)">
          <UButton variant="ghost" icon="heroicons:ellipsis-horizontal-20-solid" />
        </UDropdownMenu>
      </template>
    </UTable>

    <div v-if="(table?.tableApi?.getFilteredRowModel().rows.length || 0) > pagination.pageSize" class="flex justify-center pt-4">
      <UPagination
        :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
        :items-per-page="table?.tableApi?.getState().pagination.pageSize"
        :total="table?.tableApi?.getFilteredRowModel().rows.length"
        @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
      />
    </div>

    <Teleport defer to="#action-items">
      <TeamAddMember v-if="members && canUpdate" :members @invitation-sent="handleInvitationSent" />
      <UInput v-model="search" size="sm" label="Search" placeholder="Search a user" icon="heroicons:magnifying-glass-20-solid" />
    </Teleport>
  </div>
</template>
