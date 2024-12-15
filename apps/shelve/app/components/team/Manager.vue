<script setup lang="ts">
const teams = useTeams()

const newTeamName = ref('')
const open = ref(false)

const defaultTeamSlug = useCookie<string>('defaultTeamSlug', {
  watch: true,
})

const {
  loading,
  createTeam,
  selectTeam,
  fetchTeams,
} = useTeamsService()
fetchTeams()

const currentTeam = computed(() => teams.value.find((team) => team.slug === defaultTeamSlug.value))

const createLoading = ref(false)
async function handleCreateTeam() {
  createLoading.value = true
  await createTeam(newTeamName.value)
  newTeamName.value = ''
  createLoading.value = false
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
      disabled: team.id === currentTeam.value?.id,
      onSelect: () => {
        if (team.id === currentTeam.value?.id) return
        selectTeam(team)
      }
    }))
  }
])
</script>

<template>
  <UModal v-model:open="open" title="Switch team" description="Select a team to switch to">
    <button class="w-full cursor-pointer flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-neutral-800 p-2 rounded-lg">
      <span class="flex items-center gap-2">
        <USkeleton v-if="loading" class="size-7 rounded-full" />
        <UAvatar v-else :src="currentTeam!.logo" size="sm" alt="currentTeam.name" />
        <USkeleton v-if="loading" class="w-20 h-4" />
        <span v-else class="text-sm font-semibold">
          {{ currentTeam!.name }}
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
        :loading="createLoading"
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
              <h3 class="text-lg text-pretty max-w-xs">
                <span v-if="!newTeamName">
                  Looks like you don't have any teams yet
                </span>
                <span v-else>
                  Looks like there is no team with the name '{{ newTeamName }}'
                </span>
              </h3>
              <p v-if="!newTeamName" class="text-sm text-neutral-500">
                Create a team to start collaborating with your team members.
              </p>
            </div>
            <UButton
              :label="newTeamName ? `Create '${newTeamName}' team` : 'Create a team'"
              type="submit"
              :loading="createLoading"
              block
            />
          </form>
        </template>
      </UCommandPalette>
    </template>
  </UModal>
</template>
