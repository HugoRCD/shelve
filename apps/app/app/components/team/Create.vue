<script setup lang="ts">
const teamName = ref('')

defineProps({
  variant: {
    type: String,
    default: 'solid',
  },
  color: {
    type: String,
    default: 'primary',
  },
})

const {
  createLoading,
  fetchTeams,
  createTeam,
} = useTeams()

async function createTeamFunction(name: string) {
  createLoading.value = true
  await createTeam(name)
  createLoading.value = false
  teamName.value = ''
  await fetchTeams()
}
</script>

<template>
  <div>
    <UPopover :popper="{ arrow: true }">
      <UButton :variant :color>
        <slot />
      </UButton>
      <template #panel>
        <form @submit.prevent="createTeamFunction(teamName)">
          <UCard>
            <div class="flex flex-col gap-2">
              <p class="flex gap-2 text-sm font-semibold leading-6">
                Create a team
              </p>
              <div class="flex gap-2">
                <UInput v-model="teamName" label="Team name" placeholder="Team name" />
                <UButton :loading="createLoading" label="Create" type="submit" />
              </div>
            </div>
          </UCard>
        </form>
      </template>
    </UPopover>
  </div>
</template>

<style scoped>

</style>
