<script setup lang="ts">
definePageMeta({
  layout: 'app',
  middleware: 'protected',
})

useHead({
  title: 'App',
})

const { isOnline } = useNetwork()
</script>

<template>
  <div class="w-full">
    <NuxtPage v-if="isOnline" />
    <div v-else class="flex h-full flex-col items-center justify-center gap-2 p-5">
      <UIcon name="lucide:cloud-off" class="size-10 text-gray-400" />
      <span class="text-sm italic">No internet connection</span>
      <p class="hidden text-center text-gray-400 sm:block">
        Please check your internet connection
      </p>
    </div>
  </div>
</template>
