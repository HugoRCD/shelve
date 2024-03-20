<script setup lang="ts">
import type { Team, TeamRole } from "@shelve/types";

const teamName = ref("")
const roles = ref<TeamRole>()

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

const updateLoading = ref(false)
const deleteLoading = ref(false)

const update_team = async (team: Team) => {
  updateLoading.value = true
  await updateTeam(team)
  updateLoading.value = false
}

const delete_team = async (teamId: number) => {
  deleteLoading.value = true
  await deleteTeam(teamId)
  deleteLoading.value = false
}
</script>

<template>
  <div class="flex flex-col">
    <form class="flex flex-col">
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
      <div class="mt-6 flex gap-4">
        <UInput
          v-model="teamName"
          placeholder="Team name"
          class="flex-1"
        />
        <UButton
          :loading="createLoading"
          :disabled="!teamName"
          @click="createTeam(teamName)"
        >
          Create
        </UButton>
      </div>
      {{ teams }}
      <div v-if="teams" class="mt-6 flex flex-col gap-4">
        <div v-for="team in teams" :key="team.name" class="flex items-center gap-4">
          <div class="flex flex-col">
            <UInput
              v-model="team.name"
              placeholder="Team name"
              class="flex-1"
            />
            <p class="text-sm leading-6 text-gray-500">
              {{ team.roles.length }} members
            </p>
            <UAvatarGroup>
              <UAvatar
                v-for="role in team.roles"
                :key="role.id"
                :src="role.user.avatar"
                :alt="role.user.username"
                size="sm"
              />
            </UAvatarGroup>
            <div class="mt-4 flex gap-4">
              <UButton
                :loading="updateLoading"
                @click="() => update_team(team)"
              >
                Edit
              </UButton>
              <UButton
                :loading="deleteLoading"
                @click="() => delete_team(team.id)"
              >
                Delete
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped>

</style>
