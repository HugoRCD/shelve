<script setup lang="ts">
type SectionProps = {
  title: string
  description?: string
  image?: string
}

defineProps<SectionProps>()
</script>

<template>
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
</template>
