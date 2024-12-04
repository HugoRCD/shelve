<script setup lang="ts">
import CliInstall from '~/components/CliInstall.vue'

const teamSlug = useTeamSlug()
const pages = computed(() => {
  const teamNavigations = getNavigation('team', teamSlug.value)
  const userNavigations = getNavigation('user')
  const adminNavigations = getNavigation('admin')
  return [...teamNavigations, ...userNavigations, ...adminNavigations]
})
const route = useRoute()

const navigation = computed(() => {
  if (route.path.includes('/projects'))
    return { title: 'Project Details', to: '/projects', name: 'project', icon: 'lucide:folder-open' }
  return pages.value.find((page) => page.path === route.path) || null
})
</script>

<template>
  <div class="max-layout-width relative flex h-screen">
    <LayoutSidebar />
    <div class="main-container flex flex-1 flex-col overflow-hidden border-l border-l-neutral-200 dark:border-l-neutral-800">
      <div class="flex justify-between gap-1 border-b border-neutral-200 px-5 py-2 dark:border-b-neutral-800">
        <div class="flex items-center gap-2">
          <template v-if="navigation">
            <Transition name="slide-to-bottom" mode="out-in">
              <div :key="navigation.icon">
                <UIcon :name="navigation.icon!" class="size-5" />
              </div>
            </Transition>
            <Transition name="slide-to-top" mode="out-in">
              <h1 :key="navigation.title" class="text-lg font-semibold">
                {{ navigation.title }}
              </h1>
            </Transition>
          </template>
        </div>
        <div class="flex items-center gap-2">
          <div id="action-items">
            <!-- action-items -->
          </div>
          <LayoutSidebar mobile class="sm:hidden" />
        </div>
      </div>
      <CliInstall />
      <div class="flex h-full flex-col gap-4 overflow-y-auto px-3 py-6 sm:px-6">
        <slot />
      </div>
    </div>
  </div>
</template>
