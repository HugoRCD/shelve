<script setup lang="ts">
import type { Team } from '@types'

const props = defineProps<{
  headless?: boolean
}>()

const isSearchActive = defineModel<boolean>({ required: false })
const search = defineModel<string>('search', { required: false })
const selectedIndex = defineModel<number>('selectedIndex', { required: false, default: 0 })

const teams = useTeams()
const colorMode = useColorMode()
const { version } = useRuntimeConfig().public

const newTeamName = ref('')
const open = ref(false)
const scrollContainerRef = ref(null)
const selectedItemRef = ref(null)

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

const themeCommands = ref([
  {
    id: 'theme-light',
    label: 'Light Mode',
    icon: 'lucide:sun',
    description: 'Switch to light mode',
    action: () => {
      colorMode.preference = 'light'
      isSearchActive.value = false
    },
    keywords: ['light', 'theme', 'mode', 'day', 'bright'],
  },
  {
    id: 'theme-dark',
    label: 'Dark Mode',
    icon: 'lucide:moon',
    description: 'Switch to dark mode',
    action: () => {
      colorMode.preference = 'dark'
      isSearchActive.value = false
    },
    keywords: ['dark', 'theme', 'mode', 'night', 'black'],
  }
])

const navigationCommands = ref([
  {
    id: 'nav-home',
    label: 'Go to Dashboard',
    icon: 'lucide:layout-dashboard',
    description: 'Navigate to the dashboard',
    action: () => {
      navigateTo(`/${defaultTeamSlug.value}`)
      isSearchActive.value = false
    },
    keywords: ['home', 'dashboard', 'main'],
  },
  {
    id: 'nav-environments',
    label: 'Environments',
    icon: 'lucide:cloud',
    description: 'Navigate to the environments page',
    action: () => {
      navigateTo(`/${defaultTeamSlug.value}/environments`)
      isSearchActive.value = false
    },
    keywords: ['environments', 'projects', 'variables'],
  },
  {
    id: 'nav-settings',
    label: 'Settings',
    icon: 'lucide:settings',
    description: 'Open settings page',
    action: () => {
      navigateTo('/user/settings')
      isSearchActive.value = false
    },
    keywords: ['settings', 'preferences', 'config'],
  },
  {
    id: 'nav-profile',
    label: 'Profile',
    icon: 'lucide:user',
    description: 'View your profile',
    action: () => {
      navigateTo('/user/profile')
      isSearchActive.value = false
    },
    keywords: ['profile', 'account', 'user'],
  },
])

const teamCommands = computed(() => {
  return teams.value.map(team => ({
    id: `team-${team.id}`,
    label: team.name,
    icon: team.logo || 'lucide:users',
    isAvatar: Boolean(team.logo),
    description: `Switch to ${team.name} team`,
    action: () => selectHeadlessTeam(team),
    keywords: ['team', 'switch', team.name],
    active: team.id === currentTeam.value?.id,
  }))
})

const commandGroups = computed(() => [
  {
    id: 'teams',
    label: 'Teams',
    items: teamCommands.value
  },
  {
    id: 'navigation',
    label: 'Navigation',
    items: navigationCommands.value
  },
  {
    id: 'theme',
    label: 'Theme',
    items: themeCommands.value
  }
])

const filteredCommandGroups = computed(() => {
  if (!search.value) {
    return commandGroups.value
  }

  const searchLower = search.value.toLowerCase()

  return commandGroups.value.map(group => {
    const filteredItems = group.items.filter(item => {
      if (item.label.toLowerCase().includes(searchLower)) {
        return true
      }

      if (item.keywords && item.keywords.some(keyword => keyword.toLowerCase().includes(searchLower))) {
        return true
      }

      return !!(item.description && item.description.toLowerCase().includes(searchLower))
    })

    return {
      ...group,
      items: filteredItems,
    }
  }).filter(group => group.items.length > 0)
})

const allFilteredItems = computed(() => {
  return filteredCommandGroups.value.flatMap(group => group.items)
})

const getItemGlobalIndex = (groupIndex: number, itemIndex: number) => {
  let globalIndex = 0
  for (let i = 0; i < groupIndex; i++) {
    globalIndex += filteredCommandGroups.value[i]!.items.length
  }
  return globalIndex + itemIndex
}

const scrollToSelectedItem = () => {
  nextTick(() => {
    const selectedElement = document.querySelector('.command-item.selected')
    if (selectedElement && scrollContainerRef.value) {
      const container = scrollContainerRef.value
      // @ts-expect-error - This works
      const containerRect = container.getBoundingClientRect()
      const elementRect = selectedElement.getBoundingClientRect()

      if (elementRect.bottom > containerRect.bottom) {
        const scrollOffset = elementRect.bottom - containerRect.bottom + 8
        // @ts-expect-error - This works
        container.scrollTop += scrollOffset
      } else if (elementRect.top < containerRect.top) {
        const scrollOffset = elementRect.top - containerRect.top - 8
        // @ts-expect-error - This works
        container.scrollTop! += scrollOffset
      }
    }
  })
}

watch(selectedIndex, (newIndex) => {
  if (allFilteredItems.value.length === 0) return

  if (newIndex === -1) {
    selectedIndex.value = allFilteredItems.value.length - 1
    return
  }

  if (newIndex >= allFilteredItems.value.length) {
    selectedIndex.value = 0
  }

  scrollToSelectedItem()
})

defineShortcuts({
  enter: {
    usingInput: true,
    handler: () => {
      if (isSearchActive.value && allFilteredItems.value.length > 0) {
        const item = allFilteredItems.value[selectedIndex.value]
        if (item && item.action) {
          item.action()
          search.value = ''
          selectedIndex.value = 0
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
  nextTick(() => {
    if (scrollContainerRef.value) {
      // @ts-expect-error - This works
      scrollContainerRef.value.scrollTop! = 0
    }
  })
})

function createTeamFromSearch() {
  if (!search.value) return

  createTeam(search.value)
  isSearchActive.value = false
  search.value = ''
}

watch(isSearchActive, (newValue) => {
  if (newValue) {
    nextTick(() => {
      if (scrollContainerRef.value) {
        // @ts-expect-error - This works
        scrollContainerRef.value.scrollTop! = 0
      }
    })
  }
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
          <div
            ref="scrollContainerRef"
            class="inset-shadow-[2px_2px_10px_rgba(0,0,0,0.2)] bg-(--ui-bg)/80 m-2 rounded-lg max-h-[400px] overflow-y-auto scroll-smooth"
          >
            <div v-if="allFilteredItems.length === 0" class="px-4 py-6 text-center">
              <UIcon name="lucide:search-x" class="mx-auto mb-2 size-8 text-(--ui-text-muted)" />
              <p class="text-sm text-(--ui-text-muted)">
                No results found for "{{ search }}"
              </p>
              <div v-if="search" class="mt-4 flex justify-center">
                <CustomButton
                  :label="`Create ${search} team`"
                  @click="createTeamFromSearch"
                />
              </div>
            </div>

            <template v-else>
              <div v-for="(group, groupIndex) in filteredCommandGroups" :key="group.id" class="command-group">
                <div class="p-3 pb-1">
                  <span class="text-sm font-semibold text-(--ui-text-muted)">
                    {{ group.label }}
                  </span>
                  <Separator />
                </div>

                <div class="space-y-1">
                  <div
                    v-for="(item, itemIndex) in group.items"
                    :key="item.id"
                    :ref="selectedIndex === getItemGlobalIndex(groupIndex, itemIndex) ? 'selectedItemRef' : undefined"
                    class="command-item"
                    :class="{
                      'active': item.active,
                      'selected': selectedIndex === getItemGlobalIndex(groupIndex, itemIndex)
                    }"
                    @click="item.action()"
                  >
                    <div v-if="item.isAvatar" class="flex-shrink-0">
                      <UAvatar :src="item.icon" size="sm" :alt="item.label" />
                    </div>
                    <UIcon v-else :name="item.icon" class="size-5 text-(--ui-text-highlighted)" />

                    <div class="flex flex-col flex-1">
                      <span class="text-sm font-medium text-(--ui-text-highlighted)">
                        {{ item.label }}
                      </span>
                      <span v-if="item.description" class="text-xs text-(--ui-text-muted)">
                        {{ item.description }}
                      </span>
                    </div>

                    <UIcon v-if="item.active" name="lucide:check" class="size-4 text-(--ui-text-highlighted)" />
                  </div>
                </div>
              </div>
            </template>
          </div>

          <div>
            <Separator />
            <div class="px-2 pt-2 flex items-center justify-between">
              <div class="hidden text-xs font-mono sm:flex items-center gap-1 text-(--ui-text-muted)/50">
                <UIcon name="custom:shelve" />
                <span>
                  {{ version }}
                </span>
              </div>
              <div class="flex flex-wrap justify-center gap-x-4 text-xs text-(--ui-text-muted)">
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
        </div>
      </template>
    </UModal>
  </div>
</template>

<style scoped>
@import "tailwindcss";

.command-item {
  @apply cursor-pointer flex items-center gap-3 rounded-lg m-2 px-3 py-2.5;
  @apply hover:bg-(--ui-bg-muted) relative overflow-hidden;
}

.command-item.selected {
  @apply bg-(--ui-bg-accented)/50;
}

.command-item.active {
  @apply bg-(--ui-bg-accented)/30;
}

.command-item.selected.active {
  @apply bg-(--ui-bg-accented)/70;
}
</style>
