<script setup lang="ts">
const { title } = useAppConfig();
</script>

<template>
  <div class="flex flex-col justify-center gap-3 p-5">
    <div class="flex max-w-lg items-center gap-3">
      <div class="text-balance text-4xl font-extralight">
        Meet <span class="font-newsreader font-light italic">{{ title }}</span> a cosy home for all your <span class="font-newsreader font-light italic">projects</span>
      </div>
    </div>
    <div class="mt-3 flex gap-3">
      <NuxtLink
        to="/login"
        class="w-fit"
      >
        <CButton color="accent">
          Start your journey
        </CButton>
      </NuxtLink>
      <NuxtLink
        v-if="useCurrentUser().value"
        to="/app/dashboard"
        class="w-fit"
      >
        <CButton color="primary">
          Go to dashboard
        </CButton>
      </NuxtLink>
    </div>
  </div>
</template>
