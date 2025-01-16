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
    <UCard v-for="(item, key) in filteredStats" :key>
      <div class="flex flex-col gap-1 items-center">
        <span class="text-lg font-semibold text-neutral-800 dark:text-neutral-200">{{ item.value }}</span>
        <span class="text-sm text-neutral-600 dark:text-neutral-400">{{ capitalize(item.label) }}</span>
      </div>
    </UCard>
  </div>
</template>
