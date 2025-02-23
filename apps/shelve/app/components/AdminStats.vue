<script setup lang="ts">
const { stats, isLoading } = useStats()

const filteredStats = computed(() => {
  if (!stats.value) return []

  const { savedTime, ...rest } = stats.value
  return rest
})
</script>

<template>
  <div v-if="stats && !isLoading" class="grid sm:grid-cols-5 grid-cols-3 gap-4">
    <UCard v-for="(item, key) in filteredStats" :key variant="subtle">
      <div class="flex flex-col gap-1 items-center">
        <span class="text-lg font-semibold text-(--ui-text-highlighted)">{{ item.value }}</span>
        <span class="text-sm text-(--ui-text-muted)">{{ capitalize(item.label) }}</span>
      </div>
    </UCard>
  </div>
</template>
