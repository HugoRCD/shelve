<script setup lang="ts">
import { Role } from '@types'
import { Motion, LayoutGroup } from 'motion-v'

const route = useRoute()
const teamSlug = computed(() => route.params.teamSlug as string)
const { user } = useUserSession()

const defaultTeamSlug = useCookie<string>('defaultTeamSlug', {
  watch: true,
})

const allNavigations = computed(() => {
  const team = getNavigation('team', teamSlug.value || defaultTeamSlug.value)
  const userNav = getNavigation('user')
  const admin = user.value?.role === Role.ADMIN ? getNavigation('admin') : []

  return [...team, ...userNav, ...admin]
})

const navigationItems = ref(allNavigations.value)

const isSearchActive = ref(false)
const searchQuery = ref('')
const selectedTeamIndex = ref(0)

const toggleSearch = () => {
  isSearchActive.value = !isSearchActive.value
  selectedTeamIndex.value = 0

  if (!isSearchActive.value) {
    searchQuery.value = ''
  } else {
    setTimeout(() => {
      document.getElementById('search-input')?.focus()
    }, 100)
  }
}

defineShortcuts({
  meta_f: {
    usingInput: true,
    handler: () => toggleSearch()
  },
  meta_k: {
    usingInput: true,
    handler: () => toggleSearch()
  },
  escape: {
    usingInput: true,
    handler: () => isSearchActive.value && toggleSearch()
  },
  arrowdown: {
    usingInput: true,
    handler: () => {
      if (isSearchActive.value) {
        selectedTeamIndex.value++
      }
    }
  },
  arrowup: {
    usingInput: true,
    handler: () => {
      if (selectedTeamIndex.value > 0) {
        selectedTeamIndex.value--
      } else {
        selectedTeamIndex.value = -1
      }
    }
  },
  enter: {
    usingInput: true,
    handler: () => {}
  }
})
</script>

<template>
  <div class="navbar-wrapper flex flex-col sm:flex-row sm:items-center gap-4">
    <LayoutGroup>
      <Motion :layout="true" class="outline-none">
        <BgHighlight rounded="full" class="hover:scale-105">
          <div class="navbar">
            <div class="nav-item p-0.5! cursor-pointer" @click="toggleSearch">
              <UIcon :name="isSearchActive ? 'lucide:x' : 'lucide:search'" class="text-lg" />
            </div>
          </div>
        </BgHighlight>
      </Motion>

      <Motion
        :layout="true"
        :initial="{ borderRadius: '9999px' }"
        :transition="{ type: 'spring', stiffness: 300, damping: 30 }"
      >
        <BgHighlight rounded="full" class="flex-1">
          <Motion :layout="true" class="navbar">
            <Motion
              v-if="isSearchActive"
              :layout="true"
              class="search-container"
              :initial="{ opacity: 0 }"
              :animate="{ opacity: 1 }"
              :exit="{ opacity: 0 }"
              :transition="{ duration: 0.2 }"
            >
              <UIcon name="lucide:search" class="icon mb-0.5 mr-2" />
              <input
                id="search-input"
                v-model="searchQuery"
                type="text"
                placeholder="Search..."
                class="bg-transparent border-none outline-none size-full text-(--ui-text-highlighted) placeholder:text-(--ui-text-muted)"
              >
            </Motion>

            <Motion v-else :layout="true" class="flex items-center gap-2">
              <Motion
                v-for="nav in navigationItems"
                :key="nav.to"
                :layout="true"
                :initial="{ scale: 0.9, opacity: 0 }"
                :animate="{ scale: 1, opacity: 1 }"
                :transition="{ type: 'spring', stiffness: 500, damping: 30 }"
                :class="nav.to.includes('/admin') ? 'hidden sm:flex' : ''"
                class="flex-shrink-0"
              >
                <ULink v-bind="nav">
                  <UTooltip :text="nav.name" :content="{ side: 'top' }">
                    <div class="highlight-wrapper rounded-full" :data-active="nav.to === route.path">
                      <div class="nav-item" :data-active="nav.to === route.path">
                        <UIcon :name="nav.icon" class="icon" />
                      </div>
                    </div>
                  </UTooltip>
                </ULink>
              </Motion>
            </Motion>
          </Motion>
        </BgHighlight>
      </Motion>
    </LayoutGroup>

    <TeamManager
      v-model="isSearchActive"
      v-model:search="searchQuery"
      v-model:selected-index="selectedTeamIndex"
      headless
    />
  </div>
</template>

<style scoped>
@import "tailwindcss";

.navbar-wrapper {
  @apply absolute z-[99] bottom-2 sm:bottom-8 left-1/2 -translate-x-1/2 will-change-auto;
}

.navbar {
  @apply backdrop-blur-lg shadow-2xl flex items-center gap-1 sm:gap-2 rounded-full p-2;
  width: auto;
}

.search-container {
  @apply flex items-center size-full p-2;
  width: 320px;
}

.nav-item {
  @apply rounded-full p-2 flex items-center justify-center;
  @apply data-[active=true]:bg-(--ui-bg-accented) data-[active=true]:shadow-xl bg-transparent;
  @apply data-[active=false]:hover:inset-shadow-[2px_2px_2px_rgba(0,0,0,0.2)];
}

.dark {
  .nav-item {
    @apply data-[active=false]:hover:bg-(--ui-bg-muted) hover:shadow-md;
    @apply data-[active=false]:hover:inset-shadow-[2px_2px_5px_rgba(0,0,0,0.4),-2px_-2px_2px_rgba(255,255,255,0.08)];
  }
}

.icon {
  @apply sm:text-xl text-(--ui-text-highlighted);
}
</style>
