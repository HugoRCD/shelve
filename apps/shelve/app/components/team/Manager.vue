<script setup lang="ts">
import type { Team } from '@types'

const isSearchActive = defineModel<boolean>({ required: false })
const search = defineModel<string>('search', { required: false })
const selectedIndex = defineModel<number>('selectedIndex', { required: false, default: 0 })

// Command palette setup
const { commandGroups, createTeamFromSearch, version, currentTeam } = useAppCommands()

const {
  scrollContainerRef,
  filteredCommandGroups,
  allFilteredItems,
  getItemGlobalIndex,
  navigateUp,
  navigateDown,
  selectCurrentItem
} = useCommandPalette(search, commandGroups, {
  onClose: () => {
    isSearchActive.value = false
    search.value = ''
    selectedIndex.value = 0
  }
})

useTeamsService().fetchTeams()

// Keyboard navigation
defineShortcuts({
  enter: {
    usingInput: true,
    handler: () => {
      if (isSearchActive.value) {
        selectCurrentItem()
      }
    }
  },
  arrowup: {
    usingInput: true,
    handler: () => {
      if (isSearchActive.value) {
        navigateUp()
      }
    }
  },
  arrowdown: {
    usingInput: true,
    handler: () => {
      if (isSearchActive.value) {
        navigateDown()
      }
    }
  }
})

// Watch for selectedIndex changes from parent
watch(selectedIndex, (newIndex) => {
  if (allFilteredItems.value.length === 0) return

  if (newIndex === -1) {
    selectedIndex.value = allFilteredItems.value.length - 1
    return
  }

  if (newIndex >= allFilteredItems.value.length) {
    selectedIndex.value = 0
  }
})

// Reset scroll position when search modal opens
watch(isSearchActive, (newValue) => {
  if (newValue && scrollContainerRef.value) {
    scrollContainerRef.value.scrollTop = 0
  }
})
</script>

<template>
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
                loading-auto
                @click="createTeamFromSearch(search)"
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
                  class="command-item"
                  :class="{
                    'active': item.active,
                    'selected': selectedIndex === getItemGlobalIndex(groupIndex, itemIndex)
                  }"
                  @click="item.action(); isSearchActive = false; search = ''"
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
