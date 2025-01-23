<script setup lang="ts">
const props = defineProps({})
</script>

<template>
  <UButton
    v-bind="props"
    class="h-fit active:translate-y-[1px] w-fit rounded-lg bg-gradient-to-br from-zinc-200 from-[3%] via-zinc-600 via-40% to-zinc-900 p-[1px]"
  >
    <div class="px-2 flex items-center gap-2 text-white py-1 rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-800">
      <slot />
    </div>
  </UButton>
</template>
