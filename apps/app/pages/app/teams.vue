<script setup lang="ts">
import { Role, type Team, TeamRole } from "@shelve/types";

const user = useCurrentUser();

const search = ref("")
const teamName = ref("")

const {
  teams,
  loading,
  fetchTeams,
  createTeam,
  deleteTeam,
  upsertMember,
  removeMember,
} = useTeams();
fetchTeams()

const filteredTeams = computed(() => {
  if (!search.value) return teams.value
  return teams.value!.filter((team: Team) => team.name.toLowerCase().includes(search.value.toLowerCase()))
})

const deleteLoading = ref(false);
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

const newMember = ref({
  email: "",
  role: TeamRole.DEVELOPER,
});

const loadingMembers = ref(false);
async function upsert_member(teamId: number, email: string, role: TeamRole) {
  loadingMembers.value = true;
  await upsertMember(teamId, email, role);
  newMember.value.email = "";
  newMember.value.role = TeamRole.DEVELOPER;
  loadingMembers.value = false;
  await fetchTeams();
}

const loadingRemove = ref(false);
async function remove_member(teamId: number, memberId: number) {
  loadingRemove.value = true;
  await removeMember(teamId, memberId);
  loadingRemove.value = false;
  await fetchTeams();
}
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
              :popper="{ arrow: true }"
            >
              <UAvatar
                :src="member.user.avatar"
                :alt="member.user.username"
                size="sm"
              />
              <template #panel>
                <UCard>
                  <form @submit.prevent="upsert_member(row.id, member.user.email, member.role)">
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
                        <UButton label="Update" :loading="loadingMembers" type="submit" />
                        <UButton color="red" variant="soft" label="Remove" :loading="loadingRemove" @click="remove_member(row.id, member.id)" />
                      </div>
                    </div>
                  </form>
                </UCard>
              </template>
            </UPopover>
            <div>
              <UPopover :popper="{ arrow: true }">
                <span class="flex size-8 cursor-pointer items-center justify-center rounded-full border border-dashed border-gray-400">+</span>
                <template #panel>
                  <UCard>
                    <form @submit.prevent="upsert_member(row.id, newMember.email, newMember.role)">
                      <div class="flex flex-col gap-2">
                        <UInput v-model="newMember.email" label="Email" placeholder="Email" />
                        <div class="flex gap-2">
                          <USelect
                            v-model="newMember.role"
                            label="Role"
                            :options="roles"
                            value-attribute="value"
                            option-attribute="label"
                          />
                          <UButton label="Add member" :loading="loadingMembers" type="submit" />
                        </div>
                      </div>
                    </form>
                  </UCard>
                </template>
              </UPopover>
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
  </div>
</template>

<style scoped>

</style>
