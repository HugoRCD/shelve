<script setup lang="ts">
const pages = [...getNavigation('app'), ...getNavigation('admin')]
const route = useRoute()

const currentPage = computed(() => {
  if (route.path.includes('/app/project'))
    return { title: 'Project Details', to: '/app/project', name: 'project', icon: 'lucide:folder-open' }
  return pages.find((page) => page.to === route.path)
})
</script>

<template>
  <div class="max-layout-width relative flex h-screen">
    <LayoutSidebar class="hidden sm:flex" />
    <LayoutSectionWrapper :navigation="currentPage">
      <slot />
    </LayoutSectionWrapper>
  </div>
</template>

