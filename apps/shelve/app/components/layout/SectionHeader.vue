<script setup lang="ts">
type SectionProps = {
  title: string
  description?: string
}

defineProps<SectionProps>()
</script>

<template>
  <div>
    <h2 class="text-lg font-bold">
      {{ title }}
    </h2>
    <p class="text-sm text-(--ui-text-muted)">
      {{ description }}
    </p>
  </div>
</template>
