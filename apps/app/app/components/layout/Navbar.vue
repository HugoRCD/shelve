<script lang="ts" setup>
const navigation = getNavigation('home')
</script>

<template>
  <div>
    <nav class="fixed inset-x-0 top-0 z-50 flex items-center justify-between bg-neutral-900/50 p-4 backdrop-blur-lg sm:px-5 sm:py-2">
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
      <div class="flex items-center gap-5">
        <LandingGithubStar class="hidden sm:flex" />
        <AuthState>
          <DropdownMenu />
          <template #placeholder>
            <NuxtLink to="/login" class="btn-primary">
              Login
            </NuxtLink>
          </template>
        </AuthState>
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
