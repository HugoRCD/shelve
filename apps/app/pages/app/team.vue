<script setup lang="ts">
const teamName = ref("")
const roles = ref([])

const { data: teams, status, refresh } = useFetch("/api/team", {
  method: "GET",
})

const { status: createStatus, error: create_team_error, execute: create_team } = useFetch("/api/team", {
  method: "POST",
  body: {
    name: teamName,
  },
  immediate: false,
  watch: false,
})

async function createTeam() {
  await create_team()
  await refresh()
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
      <div class="mt-6 flex items-center gap-4">
        <UInput v-model="teamName" placeholder="Enter teammate" />
        <UButton :loading="createStatus === 'pending'" @click="createTeam">
          Add
        </UButton>
      </div>
      <div v-if="teams" class="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
        <div v-for="team in teams" :key="team.name" class="flex items-center gap-4">
          <div class="flex flex-col">
            <h3 class="text-base font-semibold leading-7">
              {{ team.name }}
            </h3>
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
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped>

</style>
