<script setup lang="ts">
import { type Team, TeamRole } from '@shelve/types'

const user = useCurrentUser()

const search = ref('')

const {
  teams,
  loading,
  fetchTeams,
  deleteTeam,
} = useTeams()
fetchTeams()

const filteredTeams = computed(() => {
  if (!search.value) return teams.value
  return teams.value!.filter((team: Team) => team.name.toLowerCase().includes(search.value.toLowerCase()))
})

const deleteLoading = ref(false)
async function deleteTeamFunction(teamId: number) {
  deleteLoading.value = true
  await deleteTeam(teamId)
  deleteLoading.value = false
}

const columns = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
  },
  {
    key: 'members',
    label: 'Members',
  },
  {
    key: 'actions',
    label: 'Actions',
  },
]

const isOwner = (team: Team) => team.members.find(member => member.userId === user.value?.id)?.role === TeamRole.OWNER

const items = (row: Team) => [
  [
    {
      label: 'Edit',
      icon: 'i-lucide-pencil',
      disabled: !isOwner(row),
    },
  ],
  [
    {
      label: 'Delete',
      icon: 'i-lucide-trash',
      iconClass: 'text-red-500 dark:text-red-500',
      disabled: !isOwner(row),
      click: () => {
        deleteTeamFunction(row.id)
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
        <p class="text-sm leading-6 text-gray-500">
          Manage your teams
        </p>
      </div>
    </div>
    <Teleport v-if="isMounted('action-items')" to="#action-items">
      <div class="hidden items-center justify-end gap-2 sm:flex">
        <TeamCreate>Create</TeamCreate>
        <UInput v-model="search" label="Search" placeholder="Search a team"
          icon="i-heroicons-magnifying-glass-20-solid" />
      </div>
    </Teleport>
    <div style="--stagger: 2" data-animate
      class="mt-2 flex flex-col justify-end gap-2 sm:hidden sm:flex-row sm:items-center">
      <TeamCreate>Create</TeamCreate>
      <UInput v-model="search" label="Search" placeholder="Search a team"
        icon="i-heroicons-magnifying-glass-20-solid" />
    </div>
    <div style="--stagger: 3" data-animate class="mt-6">
      <UTable :columns :rows="filteredTeams" :loading :items-per-page="10">
        <template #empty-state>
          <div class="flex flex-col items-center justify-center gap-3 py-6">
            <span class="text-sm italic">No teams here</span>
            <TeamCreate>
              Create a team
            </TeamCreate>
          </div>
        </template>
        <template #members-data="{ row }">
          <TeamMembers :team-id="row.id" :members="row.members" />
        </template>
        <template #actions-data="{ row }">
          <UDropdown :items="items(row)">
            <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid"
              :disabled="!isOwner(row)" />
          </UDropdown>
        </template>
      </UTable>
    </div>
  </div>
</template>
