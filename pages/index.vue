<script setup lang="ts">
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3">
    <div class="flex items-center gap-3">
      <div class="text-4xl font-bold">
        Hello World!
      </div>
      <ThemeToggle />
    </div>
    <button
      class="ml-4 inline-flex items-center justify-center rounded-md bg-black px-6 py-1 text-base font-medium text-white shadow-sm dark:bg-white dark:text-black"
      @click="() => toast.info('Hello There!')"
    >
      Render a toast
    </button>
    <Toasts />
  </div>
</template>

<style scoped lang="scss"></style>
