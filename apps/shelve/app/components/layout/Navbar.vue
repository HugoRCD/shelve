<script lang="ts" setup>
const navigation = getNavigation('home')
</script>

<template>
  <div class="z-[99]">
    <nav class="fixed top-0 flex w-full">
      <div class="backdrop" />
      <div class="z-50 flex w-full items-center justify-around p-4 sm:px-5 sm:py-2">
        <div class="flex gap-2">
          <NuxtLink to="/" class="font-newsreader text-2xl font-light italic">
            Shelve
          </NuxtLink>
          <!--          <UDivider orientation="vertical" class="mx-2" />-->
          <div class="flex items-center gap-3">
            <NuxtLink
              v-for="item in navigation"
              :key="item.name"
              class="font-geist-mono text-sm text-neutral-200 hover:text-neutral-400"
              :to="item.path"
            >
              {{ item.name }}
            </NuxtLink>
          </div>
        </div>
        <div class="flex items-center gap-5">
          <LandingGithubStar class="hidden sm:flex" />
          <AuthState>
            <DropdownMenu />
          </AuthState>
        </div>
      </div>
    </nav>
  </div>
</template>

<style scoped>
@import "tailwindcss";

.backdrop {
  @apply absolute top-0 z-40 h-40;
  @apply bg-gradient-to-b from-neutral-900 to-transparent;
}
</style>
