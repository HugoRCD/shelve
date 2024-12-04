<script setup lang="ts">
const currentTeam = useTeam()
const teamId = useTeamId()
const teams = useTeams()

const newTeamName = ref('')
const open = ref(false)

const defaultTeamId = useCookie<number>('defaultTeamId', {
  watch: true,
})

const {
  createTeam,
  selectTeam,
  fetchTeam,
  fetchTeams,
} = useTeamsService()
fetchTeams()

if (!currentTeam.value) currentTeam.value = await fetchTeam(defaultTeamId.value)

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
      avatar: {
        alt: team.name,
        size: 'sm',
        src: team.logo,
      },
      disabled: team.id === teamId.value,
      onSelect: () => {
        if (team.id === teamId.value) return
        selectTeam(team)
      }
    }))
  }
])
</script>

<template>
  <UModal v-model:open="open" title="Switch team" description="Select a team to switch to">
    <button v-if="currentTeam" class="w-full cursor-pointer flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-neutral-800 p-2 rounded-lg">
      <span class="flex items-center gap-2">
        <UAvatar :src="currentTeam.logo" size="sm" alt="currentTeam.name" />
        <span class="text-sm font-semibold">
          {{ currentTeam.name }}
        </span>
      </span>
      <UIcon name="lucide:chevrons-up-down" class="size-4" />
    </button>
    <template #content>
      <UCommandPalette
        v-model:search-term="newTeamName"
        :groups
        close
        placeholder="Search or create a team"
        :loading
        class="h-80"
        @update:open="open = $event"
      >
        <template #teams-trailing="{ item }">
          <span v-if="!item.disabled" class="text-xs text-neutral-500">
            Select team
          </span>
        </template>
        <template #empty>
          <form
            class="flex flex-col gap-1 p-4"
            @submit.prevent="handleCreateTeam"
          >
            <div class="flex flex-col gap-2 items-center mb-4">
              <UIcon name="lucide:users" class="size-8" />
              <h3 class="text-2xl font-light font-newsreader italic text-pretty max-w-xs">
                Looks like you don't have any team yet.
              </h3>
              <p class="text-sm text-neutral-500">
                Create a team to start collaborating with your team members.
              </p>
            </div>
            <UButton
              :label="`Create '${newTeamName}' team`"
              type="submit"
              :loading
              block
            />
          </form>
        </template>
      </UCommandPalette>
    </template>
  </UModal>
</template>
