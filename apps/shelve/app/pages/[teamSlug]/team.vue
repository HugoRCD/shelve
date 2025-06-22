<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import { getPaginationRowModel } from '@tanstack/vue-table'
import type { TableColumn } from '@nuxt/ui'
import type { Member } from '@types'
import { TeamRole } from '@types'
import { ConfirmModal } from '#components'

const { updateMember, removeMember, updateTeam, deleteTeam } = useTeamsService()

const currentTeam = useTeam()
const teamRole = useTeamRole()

const activeTab = ref('members')

const tabs = [
  { key: 'members', label: 'Members', icon: 'nucleo:users', slot: 'members' },
  { key: 'settings', label: 'Settings', icon: 'nucleo:gear-2', slot: 'settings' }
]

// Members logic
const members = computed(() => currentTeam.value?.members.filter((member) => member.user.username.toLowerCase().includes(search.value.toLowerCase())))
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
          description: `You are about to remove ${row.user.username} from the team.`,
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

// Settings logic
const team = currentTeam
const newSlug = ref(team.value.slug)
const settingsUpdateLoading = ref(false)
const deleteOpen = ref(false)

function updateCurrentTeam() {
  settingsUpdateLoading.value = true
  toast.promise(updateTeam({ ...team.value, slug: newSlug.value }), {
    loading: 'Updating team...',
    success: 'Team updated successfully',
    error: (data: any) => data.statusMessage || 'Error updating team',
  })
  settingsUpdateLoading.value = false
}

function deleteCurrentTeam() {
  modal.open({
    title: 'Delete Team',
    description: 'Are you sure you want to delete this team?',
    danger: true,
    onSuccess: () => {
      toast.promise(deleteTeam(), {
        loading: 'Deleting team...',
        success: 'Team deleted successfully',
        error: 'Error deleting team',
      })
    },
  })
}

useSeoMeta({
  title: 'Team',
})
</script>

<template>
  <PageSection
    title="Team"
    description="Manage team members and settings"
    :image="team?.logo"
  >
    <UTabs v-model:selected="activeTab" :items="tabs" variant="link" class="w-full">
      <template #members>
        <div class="py-6">
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
            <template #avatar-cell="{ row }">
              <UAvatar :src="row.original.user.avatar" :alt="row.original.user.username" size="sm" img-class="object-cover" />
            </template>
            <template #username-cell="{ row }">
              <span class="font-semibold">
                {{ row.original.user.username }}
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
        </div>
      </template>

      <template #settings>
        <div class="py-6">
          <form class="flex flex-col" @submit.prevent="updateCurrentTeam">
            <div class="flex flex-col gap-4">
              <div class="max-w-sm space-y-4">
                <UFormField label="Name">
                  <UInput v-model="team.name" :disabled="!canUpdate" class="w-full" />
                </UFormField>
                <UFormField label="Slug" help="This is the unique identifier for your team (used by the CLI)" :ui="{ help: 'text-xs' }">
                  <UButtonGroup class="w-full">
                    <UButton
                      color="neutral"
                      variant="subtle"
                      label="shelve.cloud/"
                    />
                    <UInput v-model="newSlug" class="w-full" :disabled="!canUpdate" />
                    <UTooltip text="Copy to clipboard">
                      <UButton color="neutral" variant="subtle" icon="lucide:clipboard" @click="copyToClipboard(team.slug)" />
                    </UTooltip>
                  </UButtonGroup>
                </UFormField>
              </div>
              <UFormField label="Logo">
                <UInput v-model="team.logo" :disabled="!canUpdate" class="w-full" />
              </UFormField>
            </div>
            <div class="mt-6 flex items-center justify-between gap-2">
              <UButton v-if="canUpdate" type="submit" :loading="settingsUpdateLoading">
                Save
              </UButton>
              <UButton v-if="canDelete" color="error" variant="solid" @click="deleteOpen = !deleteOpen">
                Delete Team
              </UButton>
            </div>
          </form>
          <div v-if="canDelete" class="mt-6">
            <UCollapsible v-model:open="deleteOpen">
              <template #content>
                <UAlert
                  title="Delete Team"
                  description="Here you can delete your team. This action is irreversible."
                  color="error"
                  variant="soft"
                  :actions="[
                    {
                      label: 'Delete',
                      color: 'error',
                      variant: 'soft',
                      onClick: deleteCurrentTeam,
                    },
                  ]"
                />
              </template>
            </UCollapsible>
          </div>
        </div>
      </template>
    </UTabs>

    <template #actions>
      <template v-if="activeTab === 'members' && canUpdate">
        <TeamAddMember v-if="members" :members />
        <UInput v-model="search" size="sm" label="Search" placeholder="Search a user" icon="heroicons:magnifying-glass-20-solid" />
      </template>
    </template>
  </PageSection>
</template> 
