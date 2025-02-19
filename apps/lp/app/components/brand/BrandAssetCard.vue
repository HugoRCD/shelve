<script setup lang="ts">
defineProps<{
  color: string
  icon: string
  showText?: boolean
}>()
</script>

<template>
  <div class="flex flex-col gap-2">
    <div
      :style="{
        color,
        backgroundColor: color === '#000000' ? '#FFFFFF' : '#0A0A0A'
      }"
      :class="[
        'flex rounded-md border border-solid border-(--ui-border)/50',
        showText ? 'items-center gap-3 px-6 py-8' : 'items-center justify-center p-4 aspect-square'
      ]"
    >
      <UIcon :name="icon" :class="showText ? 'text-3xl' : 'size-24'" />
      <span v-if="showText" class="font-bold text-3xl">Shelve</span>
    </div>
  </div>
</template>
