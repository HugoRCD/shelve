<script setup lang="ts">
const { title } = useAppConfig();
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3">
    <div class="flex items-center gap-3">
      <div class="text-4xl font-bold">
        {{ title }}
      </div>
    </div>
    <NuxtLink
      to="/app/dashboard"
      class="text-primary"
    >
      Go to dashboard
    </NuxtLink>
    <NuxtLink
      to="/login"
      class="text-primary"
    >
      Go to login
    </NuxtLink>
  </div>
</template>
