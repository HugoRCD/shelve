<script setup lang="ts">
const integrations = [
  {
    name: 'Github',
    icon: 'simple-icons:github'
  }
]
</script>

<template>
  <div class="flex flex-col gap-4 pb-4">
    <div style="--stagger: 1" data-animate class="flex flex-col gap-3">
      <div class="flex flex-col gap-1">
        <h2 class="text-lg font-bold">
          Integrations
        </h2>
        <p class="text-sm text-neutral-500">
          Connect Shelve with other services to enhance your experience.
        </p>
      </div>
      <div class="grid grid-cols-4 gap-2">
        <NuxtLink v-for="integration in integrations" :key="integration.name" :to="`/user/integrations/${integration.name.toLowerCase()}`">
          Github
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
