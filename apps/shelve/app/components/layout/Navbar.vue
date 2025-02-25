<script setup lang="ts">
import { Role } from '@types'
import { useElementSize, useResizeObserver } from '@vueuse/core'

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

watch(allNavigations, (newValue) => {
  navigationItems.value = [...newValue]
})

const handleProjectNavigation = () => {
  const isProjectRoute = route.path.includes('/projects/')
  const projectNavigation = {
    title: 'Project Details',
    icon: 'lucide:folder-open',
    to: route.path,
    name: 'Project Details',
  }

  if (isProjectRoute) {
    const indexToReplace = navigationItems.value.findIndex((item) => item.to.includes('/projects/'))
    if (indexToReplace !== -1) {
      navigationItems.value.splice(indexToReplace, 1, projectNavigation)
    } else {
      navigationItems.value = [projectNavigation, ...navigationItems.value]
    }
  } else {
    navigationItems.value = navigationItems.value.filter(item => !item.to.includes('/projects/'))
  }
}

const isSearchActive = ref(false)
const searchQuery = ref('')

const navItemsRef = ref(null)
const navbarWidth = ref('auto')

const updateNavbarWidth = () => {
  if (navItemsRef.value) {
    const width = navItemsRef.value.scrollWidth + 16
    navbarWidth.value = `${width}px`
  }
}

const toggleSearch = () => {
  isSearchActive.value = !isSearchActive.value

  if (!isSearchActive.value) {
    searchQuery.value = ''
    nextTick(() => {
      updateNavbarWidth()
    })
  } else {
    setTimeout(() => {
      document.getElementById('search-input')?.focus()
    }, 100)
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isSearchActive.value) {
    toggleSearch()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  nextTick(() => {
    updateNavbarWidth()
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

watch(() => navigationItems.value.length, () => {
  nextTick(() => {
    updateNavbarWidth()
  })
})

watch(() => route.path, handleProjectNavigation, { immediate: true })
</script>

<template>
  <div class="navbar-wrapper flex items-center gap-4">
    <BgHighlight rounded="full">
      <div class="navbar">
        <div class="nav-item cursor-pointer" @click="toggleSearch">
          <UIcon :name="isSearchActive ? 'lucide:x' : 'lucide:search'" class="text-xl" />
        </div>
      </div>
    </BgHighlight>

    <BgHighlight rounded="full">
      <div
        class="navbar main-navbar"
        :style="{ width: isSearchActive ? '320px' : navbarWidth }"
      >
        <Transition name="fade-blur" mode="out-in">
          <div v-if="isSearchActive" class="search-container">
            <UIcon name="lucide:search" class="text-xl text-(--ui-text-highlighted) mr-2" />
            <input
              id="search-input"
              v-model="searchQuery"
              type="text"
              placeholder="Search..."
              class="bg-transparent border-none outline-none w-full text-(--ui-text-highlighted) placeholder:text-(--ui-text-muted)"
            >
          </div>

          <div
            v-else
            ref="navItemsRef"
            class="flex items-center gap-2"
          >
            <div
              v-for="nav in navigationItems"
              :key="nav.to"
              :class="nav.to.includes('/admin') ? 'hidden sm:flex' : ''"
              class="flex-shrink-0"
            >
              <ULink v-bind="nav" exact>
                <UTooltip :text="nav.name" :content="{ side: 'top' }">
                  <div class="highlight-wrapper rounded-full" :data-active="nav.to === route.path">
                    <div class="nav-item" :data-active="nav.to === route.path">
                      <UIcon :name="nav.icon" class="icon" />
                    </div>
                  </div>
                </UTooltip>
              </ULink>
            </div>
          </div>
        </Transition>
      </div>
    </BgHighlight>
  </div>
</template>

<style scoped>
@import "tailwindcss";

.navbar-wrapper {
  @apply absolute z-[99] bottom-2 sm:bottom-8 left-1/2 -translate-x-1/2 transition-all duration-200;
}

.navbar {
  @apply backdrop-blur-lg shadow-2xl flex items-center gap-1 sm:gap-2 rounded-full p-2;
}

.main-navbar {
  @apply transition-all duration-300 ease-out;
  will-change: width;
}

.search-container {
  @apply flex items-center w-full px-1;
}

.nav-item {
  @apply rounded-full p-2 flex items-center justify-center;
  @apply data-[active=true]:bg-(--ui-bg-accented) data-[active=true]:shadow-xl bg-transparent;
  @apply data-[active=false]:hover:bg-(--ui-bg-muted) hover:shadow-md;
  @apply data-[active=false]:hover:inset-shadow-[2px_2px_5px_rgba(0,0,0,0.4),-2px_-2px_2px_rgba(255,255,255,0.08)];
}

.icon {
  @apply sm:text-xl text-(--ui-text-highlighted);
}

.fade-blur-enter-active,
.fade-blur-leave-active {
  transition: opacity 0.2s ease, filter 0.2s ease, transform 0.2s ease;
}

.fade-blur-enter-from,
.fade-blur-leave-to {
  opacity: 0;
  filter: blur(4px);
}

.fade-blur-enter-from {
  transform: translateX(10px);
}

.fade-blur-leave-to {
  transform: translateX(-10px);
}
</style>
