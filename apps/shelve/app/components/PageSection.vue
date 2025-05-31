<script setup lang="ts">
type SectionProps = {
  title: string
  description?: string
  image?: string
}

defineProps<SectionProps>()
</script>

<template>
  <Motion
    :initial="{ opacity: 0, transform: 'translateY(10px)' }"
    :animate="{ opacity: 1, transform: 'translateY(0)' }"
    :transition="{ delay: 0.2 }"
    class="flex flex-col gap-4"
  >
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
    <Motion
      :initial="{ opacity: 0, transform: 'translateY(10px)' }"
      :animate="{ opacity: 1, transform: 'translateY(0)' }"
      :transition="{ delay: 0.3 }"
    >
      <slot />
    </Motion>

    <Teleport defer to="#action-items">
      <slot name="actions" />
    </Teleport>
  </Motion>
</template>
