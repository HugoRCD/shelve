<script setup lang="ts">
import type { Team } from '@types'

const props = defineProps<{
  headless?: boolean
}>()

const isSearchActive = defineModel<boolean>({ required: false })
const search = defineModel<string>('search', { required: false })
const selectedIndex = defineModel<number>('selectedIndex', { required: false, default: 0 })

const teams = useTeams()

const newTeamName = ref('')
const open = ref(false)

const defaultTeamSlug = useCookie<string>('defaultTeamSlug', {
  watch: true,
})

const _currentTeam = useTeam()

const {
  loading,
  createTeam,
  selectTeam,
  fetchTeams,
} = useTeamsService()
fetchTeams()

const currentTeam = computed(() => _currentTeam.value ?? teams.value.find((team) => team.slug === defaultTeamSlug.value))

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

const filteredTeams = computed(() => {
  if (!search.value) return teams.value
  return teams.value.filter((team: Team) => {
    return team.name.toLowerCase().includes(search.value!.toLowerCase())
  })
})

watch(selectedIndex, (newIndex) => {
  if (filteredTeams.value.length === 0) return

  if (newIndex === -1) {
    selectedIndex.value = filteredTeams.value.length - 1
    return
  }

  if (newIndex >= filteredTeams.value.length) {
    selectedIndex.value = 0
  }
})

defineShortcuts({
  enter: {
    usingInput: true,
    handler: () => {
      if (isSearchActive.value && filteredTeams.value.length > 0) {
        const team = filteredTeams.value[selectedIndex.value]
        if (team) {
          selectHeadlessTeam(team)
        }
      }
    }
  }
})

function selectHeadlessTeam(team: Team) {
  if (props.headless) {
    isSearchActive.value = false
    search.value = ''
  }
  selectTeam(team)
}

watch(search, () => {
  selectedIndex.value = 0
})
</script>

<template>
  <div v-if="!headless">
    <UModal v-model:open="open" title="Switch team" description="Select a team to switch to">
      <button class="w-full cursor-pointer flex items-center justify-between hover:bg-(--ui-bg-elevated) p-2 rounded-lg">
        <span class="flex items-center gap-2">
          <USkeleton v-if="loading" class="size-7 rounded-full" />
          <UAvatar v-else-if="currentTeam" :src="currentTeam.logo" size="sm" alt="team name" />
          <USkeleton v-if="loading" class="w-20 h-4" />
          <span v-else-if="currentTeam" class="text-sm font-semibold">
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
          :loading="createLoading"
          class="h-80"
          @update:open="open = $event"
        >
          <template #teams-trailing="{ item }">
            <span v-if="!item.disabled" class="text-xs text-(--ui-text-muted)">
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
                <p v-if="!newTeamName" class="text-sm text-(--ui-text-muted)">
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
  </div>
  <div v-else>
    <UModal
      v-model:open="isSearchActive"
      :overlay="false"
      :modal="false"
      :dismissible="false"
      :ui="{
        content: 'bg-(--ui-bg-muted)',
      }"
    >
      <template #content>
        <div class="py-2 flex flex-col">
          <div class="bg-(--ui-bg)/80 m-2 rounded-lg max-h-[400px] overflow-y-auto">
            <div class="p-3 pb-1">
              <span class="text-sm font-semibold text-(--ui-text-muted)">
                Teams
              </span>
              <Separator />
            </div>
            <div v-if="filteredTeams.length === 0" class="px-4 py-6 text-center">
              <UIcon name="lucide:search-x" class="mx-auto mb-2 size-8 text-(--ui-text-muted)" />
              <p class="text-sm text-(--ui-text-muted)">
                No teams found
              </p>
              <div class="mt-4 flex justify-center">
                <CustomButton
                  :label="`Create ${search} team`"
                  @click="open = true"
                />
              </div>
            </div>

            <div v-else class="space-y-1">
              <div v-for="(team, index) in filteredTeams" :key="team.id">
                <div
                  class="team-item"
                  :class="{
                    'active': team.id === currentTeam?.id,
                    'selected': index === selectedIndex
                  }"
                  @click="selectHeadlessTeam(team)"
                >
                  <UAvatar :src="team.logo" size="sm" alt="team name" />
                  <span class="text-sm font-medium text-(--ui-text-highlighted) flex-1">
                    {{ team.name }}
                  </span>
                  <UIcon v-if="team.id === currentTeam?.id" name="lucide:check" class="size-4 text-(--ui-text-highlighted)" />
                </div>
              </div>
            </div>
          </div>

          <div>
            <Separator />
            <div class="flex flex-wrap justify-center gap-x-4 gap-y-2 pt-3 text-xs text-(--ui-text-muted)">
              <div class="space-x-1">
                <UKbd value="↑" variant="subtle" />
                <UKbd value="↓" variant="subtle" />
                <span class="shortcut-label">to navigate</span>
              </div>
              <div class="space-x-1">
                <UKbd value="Enter" variant="subtle" />
                <span class="shortcut-label">to select</span>
              </div>
              <div class="space-x-1">
                <UKbd value="Esc" variant="subtle" />
                <span class="shortcut-label">to close</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<style scoped>
@import "tailwindcss";

.team-item {
  @apply cursor-pointer flex items-center gap-3 rounded-lg m-2 px-3 py-2.5;
  @apply hover:bg-(--ui-bg-muted) relative overflow-hidden;
}

.team-item.selected {
  @apply bg-(--ui-bg-accented)/50;
}
</style>
