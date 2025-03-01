<script setup lang="ts">
import type { CommandItem } from '@types'
import { AnimatePresence, Motion } from 'motion-v'

const isSearchActive = defineModel<boolean>({ required: true })
const search = defineModel<string>('search', { required: true })
const selectedIndex = defineModel<number>('selectedIndex', { required: false, default: 0 })
const { createTeam } = useTeamsService()

// Command palette setup
const { commandGroups, version, subMenuState, deactivateSubMenu } = useAppCommands()

const {
  scrollContainerRef,
  filteredCommandGroups,
  allFilteredItems,
  getItemGlobalIndex,
  navigateUp,
  navigateDown,
  scrollToSelectedItem
} = useCommandPalette(search, commandGroups, {
  onClose: () => {
    isSearchActive.value = false
    search.value = ''
    selectedIndex.value = 0
    deactivateSubMenu()
  }
})

// Track animation direction
const direction = ref(1) // 1 = forward, -1 = backward
const isAnimating = ref(false)

// Store the index to return to
let savedMainMenuIndex = 0

// Custom deactivate function that preserves the index
const customDeactivateSubmenu = () => {
  // Store the current state
  const wasActive = subMenuState.active
  const { parentId } = subMenuState

  // Deactivate the submenu
  deactivateSubMenu()

  // If we were in a submenu, force the index after a delay
  if (wasActive) {
    setTimeout(() => {
      selectedIndex.value = savedMainMenuIndex
      scrollToSelectedItem()
    }, 100)
  }
}

// Handle submenu action
const handleSubmenuAction = (item: CommandItem, index: number) => {
  // Save the current index before entering submenu
  savedMainMenuIndex = index

  // Execute the action (which will activate the submenu)
  if (item.action) item.action()

  // Reset selection in new submenu
  selectedIndex.value = 0

  // Set animation direction
  direction.value = 1
  isAnimating.value = true
}

// Handle back action
const handleBackAction = () => {
  if (subMenuState.active) {
    direction.value = -1
    isAnimating.value = true

    // Use our custom deactivate function
    customDeactivateSubmenu()
  }
}

useTeamsService().fetchTeams()

// Keyboard navigation
defineShortcuts({
  enter: {
    usingInput: true,
    handler: () => {
      if (isSearchActive.value && allFilteredItems.value.length > 0) {
        const item = allFilteredItems.value[selectedIndex.value]
        if (item) {
          if (item.hasSubmenu) {
            handleSubmenuAction(item, selectedIndex.value)
          } else {
            if (item.action) item.action()
            isSearchActive.value = false
            search.value = ''
          }
        }
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
  },
  meta_backspace: {
    usingInput: true,
    handler: () => {
      if (isSearchActive.value && subMenuState.active) {
        handleBackAction()
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

  // Ensure selected item is visible
  scrollToSelectedItem()
})

// Reset when search modal opens
watch(isSearchActive, (newValue) => {
  if (newValue) {
    scrollContainerRef.value?.scrollTo(0, 0)
    deactivateSubMenu()
    isAnimating.value = false
    savedMainMenuIndex = 0
    selectedIndex.value = 0
  }
})

// Reset when search changes
watch(search, () => {
  savedMainMenuIndex = 0
  selectedIndex.value = 0
})

function playAction(item: CommandItem, index: number) {
  if (item.hasSubmenu) {
    handleSubmenuAction(item, index)
  } else {
    if (item.action) item.action()
    isSearchActive.value = false
    search.value = ''
  }
}
</script>

<template>
  <UModal
    v-model:open="isSearchActive"
    :overlay="false"
    :modal="false"
    :dismissible="false"
    :ui="{
      content: 'bg-(--ui-bg-muted) max-w-2xl',
    }"
  >
    <template #content>
      <div class="py-2 flex flex-col">
        <div class="screen-container">
          <div v-if="allFilteredItems.length === 0" class="px-4 py-6 text-center">
            <UIcon name="lucide:search-x" class="mx-auto mb-2 size-8 text-(--ui-text-muted)" />
            <p class="text-sm text-(--ui-text-muted)">
              No results found for "{{ search }}"
            </p>
            <div v-if="search" class="mt-4 flex justify-center">
              <CustomButton
                :label="`Create ${search} team`"
                loading-auto
                @click="createTeam(search)"
              />
            </div>
          </div>

          <div v-else>
            <AnimatePresence mode="wait" class="outline-none" @after-leave="isAnimating = false">
              <Motion
                :key="subMenuState.active ? `submenu-${subMenuState.parentId}` : 'main-menu'"
                :initial="isAnimating ? { x: direction * 30, opacity: 0 } : { x: 0, opacity: 1 }"
                :animate="{ x: 0, opacity: 1 }"
                :exit="{ x: -direction * 30, opacity: 0 }"
                :transition="{
                  type: 'tween',
                  duration: 0.08
                }"
                class="w-full"
              >
                <div ref="scrollContainerRef" class="max-h-[400px] overflow-y-auto scroll-smooth">
                  <div v-for="(group, groupIndex) in filteredCommandGroups" :key="group.id" class="group">
                    <div class="px-3 pt-2 flex items-center justify-between">
                      <span class="text-sm font-semibold text-(--ui-text-muted)">
                        {{ group.label }}
                      </span>

                      <!-- Back button for submenus -->
                      <button
                        v-if="group.backAction"
                        class="text-xs text-(--ui-text-muted) flex items-center gap-1 hover:text-(--ui-text-highlighted)"
                        @click="handleBackAction"
                      >
                        <UIcon name="lucide:arrow-left" class="size-3" />
                        <span>Back</span>
                      </button>
                    </div>

                    <div class="space-y-1">
                      <div
                        v-for="(item, itemIndex) in group.items"
                        :key="item.id"
                        class="command-item"
                        :class="{
                          'active': item.active,
                          'has-submenu': item.hasSubmenu,
                          'selected': selectedIndex === getItemGlobalIndex(groupIndex, itemIndex)
                        }"
                        @click="playAction(item, getItemGlobalIndex(groupIndex, itemIndex))"
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

                        <UIcon
                          v-if="item.hasSubmenu"
                          name="lucide:chevron-right"
                          class="size-4 text-(--ui-text-highlighted)"
                        />
                        <UIcon
                          v-else-if="item.active"
                          name="lucide:check"
                          class="size-4 text-(--ui-text-highlighted)"
                        />
                      </div>
                    </div>
                    <Separator class="group-last:hidden my-2" />
                  </div>
                </div>
              </Motion>
            </AnimatePresence>
          </div>
        </div>

        <div>
          <Separator />
          <div class="px-2 pt-2 flex items-center justify-between">
            <div class="text-xs font-mono flex items-center gap-1 text-(--ui-text-muted)/50">
              <UIcon name="custom:shelve" />
              <span>
                {{ version }}
              </span>
            </div>
            <div class="max-sm:hidden flex flex-wrap justify-center gap-x-4 text-xs text-(--ui-text-muted)">
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
              <div v-if="subMenuState.active" class="space-x-1">
                <UKbd value="⌘" variant="subtle" />
                <UKbd value="⌫" variant="subtle" />
                <span class="shortcut-label">to go back</span>
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

.screen-container {
  @apply bg-(--ui-bg)/80 m-2 rounded-lg max-h-[400px] overflow-hidden;
  box-shadow: inset 3px 3px 5px rgba(173, 173, 173, 0.3);
}

.dark .screen-container {
  box-shadow: inset 3px 3px 10px rgb(0 0 0 / 0.2);
}

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

.command-item.has-submenu {
  @apply pr-2;
}

.command-item.has-submenu:hover {
  @apply bg-(--ui-bg-muted)/70;
}
</style>
