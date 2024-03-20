<script setup lang="ts">
import type { Member, Team } from "@shelve/types";
import { TeamRole } from "@shelve/types";

const search = ref("")
const teamName = ref("")
const createModal = ref(false)
const members = ref<Member[]>()

const {
  teams,
  loading,
  createLoading,
  fetchTeams,
  createTeam,
  updateTeam,
  deleteTeam,
} = useTeams();
fetchTeams()

const filteredTeams = computed(() => {
  if (!search.value) return teams.value
  return teams.value!.filter((team: Team) => team.name.toLowerCase().includes(search.value.toLowerCase()))
})

const updateLoading = ref(false)
const deleteLoading = ref(false)

async function create_team(teamName: string) {
  createLoading.value = true;
  await createTeam(teamName);
  createLoading.value = false;
  createModal.value = false;
  await fetchTeams();
}

async function update_team(team: Team) {
  updateLoading.value = true;
  await updateTeam(team);
  updateLoading.value = false;
}

async function delete_team(teamId: number) {
  deleteLoading.value = true;
  await deleteTeam(teamId);
  deleteLoading.value = false;
  await fetchTeams();
}

const columns = [
  {
    key: "name",
    label: "Name",
    sortable: true,
  },
  {
    key: "members",
    label: "Members",
  },
  {
    key: "createdAt",
    label: "Created At",
    sortable: true,
  },
  {
    key: "updatedAt",
    label: "Updated At",
    sortable: true,
  },
  {
    key: "actions",
    label: "Actions",
  },
];

const items = (row: Team) => [
  [
    {
      label: "Edit",
      icon: "i-lucide-pencil",
    },
  ],
  [
    {
      label: "Delete",
      icon: "i-lucide-trash",
      iconClass: "text-red-500 dark:text-red-500",
      click: () => {
        delete_team(row.id)
      },
    },
  ],
];
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
    <div style="--stagger: 2" data-animate class="flex flex-col justify-end gap-4 sm:flex-row sm:items-center">
      <UButton
        @click="() => createModal = true"
      >
        Create
      </UButton>
      <UInput v-model="search" label="Search" placeholder="Search a team" icon="i-heroicons-magnifying-glass-20-solid" />
    </div>
    <div v-if="teams" style="--stagger: 3" data-animate class="mt-6">
      <UTable
        :columns="columns"
        :rows="filteredTeams"
        :loading="loading"
        :items-per-page="10"
      >
        <template #empty-state>
          <div class="flex flex-col items-center justify-center gap-3 py-6">
            <span class="text-sm italic">No teams here</span>
            <UButton @click="createTeam(teamName)">
              Create a team
            </UButton>
          </div>
        </template>
        <template #members-data="{ row }">
          <UAvatarGroup>
            <UAvatar
              v-for="role in row.members"
              :key="role.id"
              :src="role.user.avatar"
              :alt="role.user.username"
              size="sm"
            />
          </UAvatarGroup>
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
    <UModal v-model="createModal">
      <form @submit.prevent="create_team(teamName)">
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold leading-7">
              Create a team
            </h2>
          </template>
          <UInput v-model="teamName" label="Team name" placeholder="Team name" class="my-4" />
          <template #footer>
            <div class="flex justify-end gap-4">
              <UButton color="gray" label="Cancel" @click="() => createModal = false" />
              <UButton :loading="createLoading" label="Create" type="submit" @click="createTeam(teamName)" />
            </div>
          </template>
        </UCard>
      </form>
    </UModal>
  </div>
</template>

<style scoped>

</style>
