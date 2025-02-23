<script setup lang="ts">
const route = useRoute()
const teamSlug = computed(() => route.params.teamSlug as string)
const pages = computed(() => {
  const teamNavigations = getNavigation('team', teamSlug.value)
  const userNavigations = getNavigation('user')
  const adminNavigations = getNavigation('admin')
  return [...teamNavigations, ...userNavigations, ...adminNavigations]
})

const navigation = computed(() => {
  if (route.path.includes('/projects'))
    return { title: 'Project Details', to: '/projects', name: 'project', icon: 'lucide:folder-open' }
  return pages.value.find((page) => page.path === route.path) || null
})

const routeTitle = computed(() => {
  return route.meta.title as string
})


const show = ref(true)
</script>

<template>
  <div class="max-layout-width relative flex h-screen">
    <LayoutSidebar />
    <div class="main-container flex flex-1 flex-col overflow-hidden border-l border-l-(--ui-border)">
      <div class="flex justify-between gap-1 border-b border-(--ui-border) px-5 py-2">
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
          <template v-else-if="route.meta.icon">
            <Transition name="slide-to-bottom" mode="out-in">
              <div :key="route.meta.icon as string">
                <UIcon :name="route.meta.icon as string" class="size-5" />
              </div>
            </Transition>
            <Transition name="slide-to-top" mode="out-in">
              <h1 :key="routeTitle.toLowerCase()" class="text-lg font-semibold">
                {{ routeTitle }}
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
