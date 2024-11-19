<script setup lang="ts">
const pages = [...getNavigation('team'), ...getNavigation('user'), ...getNavigation('admin')]
const route = useRoute()

const navigation = computed(() => {
  if (route.path.includes('/project'))
    return { title: 'Project Details', to: '/project', name: 'project', icon: 'lucide:folder-open' }
  return pages.find((page) => page.path === route.path) || null
})
</script>

<template>
  <div class="max-layout-width relative flex h-screen">
    <LayoutSidebar class="hidden sm:flex" />
    <div class="main-container flex flex-1 flex-col overflow-hidden border-l border-l-neutral-200 dark:border-l-neutral-800">
      <div class="flex justify-between gap-1 border-b border-neutral-200 px-5 py-2 dark:border-b-neutral-800">
        <div class="flex items-center gap-2">
          <template v-if="navigation">
            <Transition name="slide-to-bottom" mode="out-in">
              <div :key="navigation.icon">
                <UIcon :name="navigation.icon" class="size-5" />
              </div>
            </Transition>
            <Transition name="slide-to-top" mode="out-in">
              <h1 :key="navigation.title" class="text-lg font-bold">
                {{ navigation.title }}
              </h1>
            </Transition>
          </template>
        </div>
        <div class="flex items-center gap-2">
          <div id="action-items">
            <!-- action-items -->
          </div>
          <UserDropdown />
        </div>
      </div>
      <div class="flex h-full flex-col gap-4 overflow-y-auto px-3 py-6 sm:px-6">
        <slot />
      </div>
    </div>
  </div>
</template>

