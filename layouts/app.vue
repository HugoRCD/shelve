<script setup lang="ts">
const pages = [...getNavigation("app"), ...getNavigation("admin")];
const route = useRoute();

const currentPage = computed(() => {
  const page = pages.find((page) => page.to === route.path);
  const fallback = route.path.includes("/app/project")
      ? { title: "Project Details", to: "/app/project", name: "project", icon: "i-lucide-folder-open" }
      : { title: "404", to: "/404", name: "404", icon: "i-heroicons-exclamation-triangle" };
  return page ?? fallback;
});
</script>

<template>
  <div class="max-layout-width relative flex h-screen">
    <LayoutSidebar class="hidden sm:flex" />
    <LayoutSectionWrapper :navigation="currentPage">
      <slot />
    </LayoutSectionWrapper>
  </div>
</template>

