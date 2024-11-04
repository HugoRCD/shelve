<script setup lang="ts">
import { Role, type Team, TeamRole } from '@shelve/types'
import type { TableColumn } from '@nuxt/ui'
import { ConfirmModal } from '#components'

definePageMeta({
  middleware: 'protected',
})

const { user } = useUserSession()

const search = ref('')

const {
  teams,
  loading,
  fetchTeams,
  deleteTeam,
} = useTeams()

if (!teams.value)
  await fetchTeams()

const filteredTeams = computed(() => {
  if (!search.value) return teams.value
  return teams.value!.filter((team: Team) => team.name.toLowerCase().includes(search.value.toLowerCase()))
})

const columns: TableColumn<Team>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'members',
    header: 'Members',
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
  },
]

const currentTeamMemberUserId = computed(() => teamMembers.value.find(member => member.userId === user.value?.id)?.userId)

const isOwner = (team: Team) => team.members.find(member => member.userId === user.value?.id)?.role === TeamRole.OWNER || user.value?.role === Role.ADMIN

const modal = useModal()
const items = (row: Team) => [
  [
    {
      label: 'Edit',
      icon: 'lucide:pencil',
      disabled: !isOwner(row),
    },
  ],
  [
    {
      label: 'Delete',
      icon: 'lucide:trash',
      iconClass: 'text-red-500 dark:text-red-500',
      disabled: !isOwner(row),
      onSelect: () => {
        modal.open(ConfirmModal, {
          title: 'Are you sure?',
          description: `You are about to delete ${row.name}, this action cannot be undone.`,
          danger: true,
          onSuccess() {
            toast.promise(deleteTeam(row.id), {
              loading: 'Deleting team...',
              success: 'Team has been deleted',
              error: 'Failed to delete team',
            })
          },
        })
      },
    },
  ],
]
</script>

<template>
  <div class="flex flex-col">
    <div style="--stagger: 1" data-animate class="flex items-center gap-4">
      <div>
        <h2 class="text-base font-semibold leading-7">
          Teams
        </h2>
        <p class="text-sm leading-6 text-neutral-500">
          Manage your teams
        </p>
      </div>
    </div>
    <Teleport defer to="#action-items">
      <div class="hidden items-center justify-end gap-2 sm:flex">
        <TeamCreate>Create</TeamCreate>
        <UInput
          v-model="search"
          label="Search"
          size="xs"
          placeholder="Search a team"
          icon="heroicons:magnifying-glass-20-solid"
        />
      </div>
    </Teleport>
    <div
      style="--stagger: 2"
      data-animate
      class="mt-2 flex flex-col justify-end gap-2 sm:hidden sm:flex-row sm:items-center"
    >
      <TeamCreate>Create</TeamCreate>
      <UInput
        v-model="search"
        label="Search"
        placeholder="Search a team"
        icon="heroicons:magnifying-glass-20-solid"
      />
    </div>
    <div style="--stagger: 3" data-animate class="mt-6">
      <UTable :columns :data="filteredTeams" :loading>
        <!--        <template #empty-state>
          <div class="flex flex-col items-center justify-center gap-3 py-6">
            <span class="text-sm italic">No teams here</span>
            <TeamCreate>
              Create a team
            </TeamCreate>
          </div>
        </template>-->
        <template #members-cell="{ row }">
          <TeamMembers :team-id="row.original.id" :members="row.original.members" />
        </template>
        <template #actions-cell="{ row }">
          <UDropdownMenu :items="items(row.original)">
            <UButton
              color="neutral"
              variant="ghost"
              icon="heroicons:ellipsis-horizontal-20-solid"
              :disabled="!isOwner(row.original)"
            />
          </UDropdownMenu>
        </template>
      </UTable>
    </div>
  </div>
</template>
