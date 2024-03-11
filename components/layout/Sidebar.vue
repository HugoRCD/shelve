<script setup lang="ts">
const session = useSession();
const navigations = getNavigation("app");
const admin_navigations = getNavigation("admin");

const route = useRoute();
const handleProjectNavigation = () => {
  const isCryptoRoute = route.path.includes("/app/project/");
  const projectNavigation = {
    title: "Project Details",
    icon: "i-lucide-folder-open",
    to: route.path,
    name: "Project Details",
  };
  if (isCryptoRoute) {
    const indexToReplace = navigations.findIndex((item) => item.to.includes("/app/project/"));
    if (indexToReplace !== -1) {
      navigations.splice(indexToReplace, 1, projectNavigation);
    } else {
      navigations.unshift(projectNavigation);
    }
  } else {
    const indexToRemove = navigations.findIndex((item) => item.to.includes("/app/project/"));
    if (indexToRemove !== -1) {
      navigations.splice(indexToRemove, 1);
    }
  }
};

watch(() => route.path, handleProjectNavigation, { immediate: true });
</script>

<template>
  <div class="flex flex-col gap-4 p-4 sm:w-[250px]">
    <div class="mb-4">
      <NuxtLink to="/" class="font-newsreader text-2xl font-light italic">
        Shelves
      </NuxtLink>
    </div>
    <div class="flex flex-col gap-2">
      <TransitionGroup name="fade" tag="ul" class="flex flex-col gap-3" mode="out-in">
        <LayoutNavItem v-for="nav in navigations" :key="nav.name" :active="nav.to === $route.path" :nav_item="nav" />
      </TransitionGroup>
    </div>
    <!--    <Transition name="slide" mode="out-in">
      &lt;!&ndash; Admin &ndash;&gt;
      <div v-if="session.isAdmin" class="flex flex-col gap-2">
        <UDivider class="my-3" />
        <LayoutNavItem v-for="nav in admin_navigations" :key="nav.name" :active="nav.to === $route.path" :nav_item="nav" />
      </div>
    </Transition>-->
    <div class="flex-1" />
    <div>
      <SettingThemeToggle />
    </div>
  </div>
</template>

<style scoped>
.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scaleY(0.01) translate(30px, 0);
}

.fade-leave-active {
  position: absolute;
}
</style>
