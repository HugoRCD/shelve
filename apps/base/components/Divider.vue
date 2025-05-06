<script setup lang="ts">
defineProps<{
  text?: string
}>()

const slot = defineSlots<{
  default:() => void
}>()
</script>

<template>
  <div class="linebreak relative inset-0 h-[1px] w-full mx-auto">
    <div class="absolute flex w-full -translate-y-1/2 items-center justify-center text-muted">
      <div class="bg-default px-2">
        <span v-if="text && !!slot.default">
          {{ text }}
        </span>
        <slot v-else />
      </div>
    </div>
  </div>
</template>

<style scoped>
.linebreak {
  background-image: linear-gradient(95deg, rgba(215, 196, 255, 0) 0%, rgba(200, 200, 200, 0.24) 50%, rgba(215, 196, 255, 0) 100%);
}
</style>
