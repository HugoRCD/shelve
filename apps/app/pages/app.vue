<script setup lang="ts">
definePageMeta({
  layout: "app",
  middleware: "protected",
});
</script>

<template>
  <div class="w-full">
    <Suspense>
      <NuxtPage />
      <template #fallback>
        Loading...
      </template>
    </Suspense>
  </div>
</template>

<style scoped lang="scss"></style>
