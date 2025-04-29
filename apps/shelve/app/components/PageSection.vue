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
    <div class="flex items-center gap-4 mb-2">
      <NuxtImg v-if="image" :src="image" class="size-10 rounded-full" format="webp" />
      <div>
        <h2 class="text-lg font-bold">
          {{ title }}
        </h2>
        <p class="text-sm text-muted">
          {{ description }}
        </p>
      </div>
    </div>
    <div :style="{ '--stagger': stagger === 1 ? 2 : 0 }" v-bind="{ 'data-animate': !!stagger }">
      <slot />
    </div>

    <Teleport defer to="#action-items">
      <slot name="actions" />
    </Teleport>
  </div>
</template>
