<script setup lang="ts">
import { type Member, Role, type Team, TeamRole } from "@shelve/types";

const user = useCurrentUser();

const search = ref("")
const teamName = ref("")

const editModal = ref(false)
const addMemberModal = ref(false)

const {
  teams,
  loading,
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

const roles = [
  {
    label: "Developer",
    value: TeamRole.DEVELOPER,
  },
  {
    label: "Admin",
    value: TeamRole.ADMIN,
    disabled: user.value?.role !== Role.ADMIN,
  },
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
      <TeamCreate />
      <UInput v-model="search" label="Search" placeholder="Search a team" icon="i-heroicons-magnifying-glass-20-solid" />
    </div>
    <div style="--stagger: 3" data-animate class="mt-6">
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
          <UAvatarGroup
            :ui="{
              ring: 'ring-0'
            }"
          >
            <UPopover
              v-for="member in row.members"
              :key="member.id"
            >
              <UAvatar
                :src="member.user.avatar"
                :alt="member.user.username"
                size="sm"
              />
              <template #panel>
                <UCard>
                  <div class="flex flex-col gap-2">
                    <p class="flex gap-2 text-sm font-semibold leading-6">
                      <span class="text-gray-200">{{ member.user.username }}</span>
                      <span>({{ member.user.email }})</span>
                    </p>
                    <div class="flex gap-2">
                      <USelect
                        v-model="member.role"
                        label="Role"
                        :options="roles"
                        value-attribute="value"
                        option-attribute="label"
                      />
                      <UButton label="Update" />
                      <UButton color="red" variant="soft" label="Remove" />
                    </div>
                  </div>
                </UCard>
              </template>
            </UPopover>
            <div
              class="flex size-8 cursor-pointer items-center justify-center rounded-full border border-dashed border-gray-400"
              @click="addMemberModal = true"
            >
              +
            </div>
          </UAvatarGroup>
        </template>
        <template #actions-data="{ row }">
          <UDropdown :items="items(row)">
            <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
          </UDropdown>
        </template>
      </UTable>
    </div>
    <TeamAddMember v-model="addMemberModal" />
  </div>
</template>

<style scoped>

</style>
