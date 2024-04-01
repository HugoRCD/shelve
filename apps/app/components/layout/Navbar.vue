<script lang="ts" setup>
const navigation = getNavigation('home')
const user = useCurrentUser()
</script>

<template>
  <div>
    <nav class="flex items-center justify-between p-5">
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
      <div>
        <DropdownMenu v-if="user" />
      </div>
    </nav>
    <slot />
  </div>
</template>

<style scoped>
.nav-pill {
  @apply flex gap-5 rounded-full px-6 py-2;
  @apply hover:bg-gray-800;
  @apply border border-transparent hover:border-gray-600;
  @apply transition-colors duration-200;
}
</style>
