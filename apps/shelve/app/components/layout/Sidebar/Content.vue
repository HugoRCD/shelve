<script setup lang="ts">
import { Role } from '@shelve/types'

const { user } = useUserSession()
const teamNavigations = getNavigation('team')
const userNavigations = getNavigation('user')
const adminNavigations = getNavigation('admin')

const route = useRoute()
const handleProjectNavigation = () => {
  const isCryptoRoute = route.path.includes('/projects/')
  const projectNavigation = {
    title: 'Project Details',
    icon: 'lucide:folder-open',
    path: route.path,
    name: 'Project Details',
  }
  if (isCryptoRoute) {
    const indexToReplace = teamNavigations.findIndex((item) => item.path.includes('/projects/'))
    if (indexToReplace !== -1) {
      teamNavigations.splice(indexToReplace, 1, projectNavigation)
    } else {
      teamNavigations.unshift(projectNavigation)
    }
  } else {
    const indexToRemove = teamNavigations.findIndex((item) => item.path.includes('/projects/'))
    if (indexToRemove !== -1) {
      teamNavigations.splice(indexToRemove, 1)
    }
  }
}

watch(() => route.path, handleProjectNavigation, { immediate: true })
</script>

<template>
  <div class="flex h-full flex-col gap-4 p-4 sm:w-[250px]">
    <div class="mb-2 flex items-center gap-2">
      <UIcon name="custom:shelve" size="size-5" />
      <NuxtLink to="/" class="font-geist font-semibold">
        Shelve
      </NuxtLink>
    </div>

    <div>
      <TeamManager />
    </div>

    <!-- Team -->
    <div class="flex flex-col gap-2">
      <div class="text-xs font-medium text-neutral-500 dark:text-neutral-400">
        Team
      </div>
      <div class="flex flex-col gap-2">
        <TransitionGroup name="bezier" tag="ul" class="flex flex-col gap-2" mode="out-in">
          <LayoutNavItem v-for="nav in teamNavigations" :key="nav.name" :active="nav.path === route.path" :nav-item="nav" />
        </TransitionGroup>
      </div>
    </div>

    <div v-if="user" class="flex flex-col gap-2">
      <USeparator class="my-3" />
      <div class="text-xs font-medium text-neutral-500 dark:text-neutral-400">
        User
      </div>
      <LayoutNavItem v-for="nav in userNavigations" :key="nav.name" :active="nav.path === route.path" :nav-item="nav" />
    </div>

    <!-- Admin -->
    <div v-if="user && user.role === Role.ADMIN" class="flex flex-col gap-2">
      <USeparator class="my-3" />
      <div class="text-xs font-medium text-neutral-500 dark:text-neutral-400">
        Admin
      </div>
      <LayoutNavItem v-for="nav in adminNavigations" :key="nav.name" :active="nav.path === route.path" :nav-item="nav" />
    </div>

    <div class="flex-1" />
    <div class="flex flex-row justify-between">
      <UTooltip text="Change theme" :content="{ side: 'top' }">
        <SettingThemeToggle size="size-5" />
      </UTooltip>
      <UTooltip text="Need help?" :content="{ side: 'top' }">
        <UButton color="neutral" variant="ghost" icon="lucide:life-buoy" to="https://github.com/HugoRCD/shelve/issues" />
      </UTooltip>
    </div>
  </div>
</template>

<style>
/* Bezier effect */

.bezier-move,
.bezier-enter-active,
.bezier-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

.bezier-enter-from,
.bezier-leave-to {
  opacity: 0;
  transform: scaleY(0.01) translate(30px, 0);
}

.bezier-leave-active {
  position: absolute;
}
</style>
