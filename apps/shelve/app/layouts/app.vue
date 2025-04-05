<script setup lang="ts">
const route = useRoute()
const teamSlug = computed(() => route.params.teamSlug as string)
const pages = computed(() => {
  const teamNavigations = getNavigation('team', teamSlug.value)
  const userNavigations = getNavigation('user')
  const adminNavigations = getNavigation('admin')
  return [...teamNavigations, ...userNavigations, ...adminNavigations]
})

const { user } = useUserSession()

const navigation = computed(() => {
  if (route.path.includes('/projects'))
    return { title: 'Project Details', to: '/projects', name: 'project', icon: 'lucide:folder-open' }
  return pages.value.find((page) => page.to === route.path) || null
})

const routeTitle = computed(() => {
  return route.meta.title as string
})

const title = computed(() => {
  return route.path === `/${teamSlug.value}` ? `Welcome, ${user.value?.username}` : navigation.value?.title || routeTitle.value
})
</script>

<template>
  <div class="relative flex min-h-dvh">
    <LayoutNavbar />
    <div class="size-full noise -z-10 absolute opacity-40" />
    <div class="main-container flex flex-1 flex-col overflow-hidden">
      <div class="flex justify-between gap-1">
        <div class="flex items-end gap-2">
          <NuxtLink to="/">
            <Logo :text="false" size="size-6 sm:size-8" />
          </NuxtLink>
          <Transition name="slide-to-top" mode="out-in">
            <h1 :key="title" class="sm:text-xl font-semibold italic">
              {{ title }}
            </h1>
          </Transition>
        </div>
        <div class="flex items-center gap-2">
          <div id="action-items" class="hidden sm:flex items-center gap-1">
            <!-- action-items -->
          </div>
          <UserDropdown />
        </div>
      </div>
      <div class="flex flex-col overflow-y-auto no-scrollbar border border-(--ui-border)/50 gap-4 mt-4 sm:mt-12 mb-24 p-4 sm:p-6 bg-(--ui-bg) rounded-md">
        <CliInstall />
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "tailwindcss";

.main-container {
  @apply w-full mx-auto max-w-[90rem] mt-4 sm:mt-10 px-4 sm:px-6;
}
</style>
