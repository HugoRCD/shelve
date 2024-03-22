<script setup lang="ts">
const teamName = ref("")
const show = ref(false)

const {
  createLoading,
  fetchTeams,
  createTeam,
} = useTeams();

async function create_team(teamName: string) {
  createLoading.value = true;
  await createTeam(teamName);
  createLoading.value = false;
  show.value = false;
  await fetchTeams();
}
</script>

<template>
  <div>
    <UButton label="Create" @click="() => show = true" />
    <UModal v-model="show">
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
              <UButton color="gray" label="Cancel" @click="() => show = false" />
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
