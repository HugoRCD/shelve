<script setup lang="ts">
const { title } = useAppConfig()
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-2">
    <div class="flex max-w-lg items-center justify-center gap-3">
      <div class="text-balance text-center text-3xl font-extralight sm:text-4xl">
        Meet <span class="font-newsreader font-light italic">{{ title }}</span> a cosy home for all your <span class="font-newsreader font-light italic">projects</span>
      </div>
    </div>
    <NuxtLink
      to="/login"
      class="w-fit"
    >
      <UButton size="lg" class="px-3 py-2">
        Start your journey
      </UButton>
    </NuxtLink>
  </div>
</template>

<style scoped>

</style>
