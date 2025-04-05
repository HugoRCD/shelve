<script setup lang="ts">
type SectionProps = {
  title: string
  description?: string
  image?: string
  stagger?: number
}

defineProps<SectionProps>()
</script>

<template>
  <div :style="{ '--stagger': stagger }" v-bind="stagger ? { 'data-animate': true } : {}" class="flex flex-col gap-4">
    <div class="flex items-center gap-4">
      <NuxtImg v-if="image" :src="image" class="size-10 rounded-full" format="webp" />
      <div>
        <h2 class="text-lg font-bold">
          {{ title }}
        </h2>
        <p class="text-sm text-(--ui-text-muted)">
          {{ description }}
        </p>
      </div>
    </div>
    <slot />
  </div>
</template>
