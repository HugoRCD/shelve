<script setup lang="ts">
const { title } = useAppConfig()
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center gap-3 p-5">
    <div class="flex max-w-lg items-center justify-center gap-3">
      <div class="text-balance text-center text-3xl font-extralight sm:text-4xl">
        Meet <span class="font-newsreader font-light italic">{{ title }}</span> a cosy home for all your <span class="font-newsreader font-light italic">projects</span>
      </div>
    </div>
    <div class="mt-3 flex gap-3">
      <NuxtLink
        to="/login"
        class="w-fit"
      >
        <UButton size="lg" class="px-3 py-2">
          Start your journey
        </UButton>
      </NuxtLink>
      <NuxtLink
        v-if="useCurrentUser().value"
        to="/app/projects"
        class="w-fit"
      >
        <UButton size="lg" class="px-3 py-2" color="gray">
          Go to dashboard
        </UButton>
      </NuxtLink>
    </div>
  </div>
</template>
