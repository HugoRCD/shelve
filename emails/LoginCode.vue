<script setup lang="ts">
defineProps({
  code: {
    type: Number,
    required: true
  }
});
</script>

<template>
  <ETailwind>
    <div class="flex h-full flex-col items-center justify-center">
      <div class="flex flex-col justify-center gap-4">
        <div class="flex flex-col items-center justify-center space-y-2 text-center">
          <h1 class="text-center text-3xl leading-9">
            Your login code is: <span class="font-newsreader font-light italic">{{ code }}</span>
          </h1>
          <p class="max-w-sm text-pretty text-sm leading-5 text-tertiary">
            Use this code to login to your account
          </p>
        </div>
      </div>
    </div>
  </ETailwind>
</template>

<style scoped>

</style>
