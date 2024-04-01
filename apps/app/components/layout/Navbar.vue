<script lang="ts" setup>
const navigation = getNavigation('home')
const user = useCurrentUser()
</script>

<template>
  <div>
    <nav class="flex items-center justify-between p-4 sm:p-5">
      <NuxtLink to="/" class="font-newsreader text-2xl font-light italic">
        Shelve
      </NuxtLink>
      <div class="nav-pill">
        <NuxtLink
          v-for="item in navigation"
          :key="item.name"
          class="text-sm text-gray-300 hover:text-gray-400"
          :to="item.to"
        >
          {{ item.name }}
        </NuxtLink>
      </div>
      <div class="hidden items-center gap-5 sm:flex">
        <LandingGithubStar />
        <DropdownMenu v-if="user" />
        <NuxtLink v-else to="/login" class="btn-primary">
          Login
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.nav-pill {
  @apply flex gap-3 sm:gap-5 rounded-full sm:px-6 sm:py-2;
  @apply sm:hover:bg-gray-800/50;
  @apply border border-transparent sm:hover:border-gray-600/50 hover:shadow-lg;
  @apply transition-colors duration-300;
}

.btn-primary {
  @apply px-4 py-2 text-sm font-semibold text-white;
  @apply bg-neutral-800 hover:bg-neutral-700;
  @apply rounded-full shadow-md;
}
</style>
