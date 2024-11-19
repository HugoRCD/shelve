<script setup lang="ts">
const currentTeam = useCurrentTeam()
const teamId = useTeamId()
const teams = useUserTeams()

const newTeamName = ref('')

const {
  createTeam,
  selectTeam,
  fetchTeams
} = useTeams()

const loading = ref(false)
async function handleCreateTeam() {
  loading.value = true
  await createTeam(newTeamName.value)
  newTeamName.value = ''
  loading.value = false
}

const groups = computed(() => [
  {
    id: 'teams',
    label: 'Teams',
    slot: 'teams',
    items: teams.value.map((team) => ({
      label: team.name,
      disabled: team.id === teamId.value,
      onSelect: () => {
        selectTeam(team.id)
      }
    }))
  }
])
</script>

<template>
  <UModal>
    <UButton
      :label="currentTeam.name"
      color="neutral"
      size="sm"
      :avatar="{
        src: currentTeam.logo,
        size: 'xs',
        alt: currentTeam.name
      }"
      class="w-full"
      block
      trailing-icon="lucide:grip"
    />

    <template #content>
      <UCommandPalette
        v-model:search-term="newTeamName"
        :groups
        placeholder="Search or create a team"
        :loading
        class="h-80"
      >
        <template #teams-trailing>
          <span>
            Select team
          </span>
        </template>
        <template #empty>
          <form
            class="flex flex-col gap-2 p-4"
            @submit.prevent="handleCreateTeam"
          >
            <UFormField label="Create a new team">
              <UInput
                v-model="newTeamName"
                placeholder="Team name"
                class="w-full"
              />
            </UFormField>
            <UButton
              label="Create team"
              color="primary"
              type="submit"
              :loading
            />
          </form>
        </template>
      </UCommandPalette>
    </template>
  </UModal>
</template>

