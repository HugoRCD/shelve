<script setup lang="ts">
defineProps<{
  tone: string[]
  keywords: string[]
}>()
</script>

<template>
  <div class="grid lg:grid-cols-2 gap-6">
    <UCard class="h-full">
      <template #header>
        <h4 class="font-medium">
          Tone of Voice
        </h4>
      </template>
      <ul class="space-y-2">
        <li
          v-for="item in tone"
          :key="item"
          class="flex items-center gap-2"
        >
          <UIcon name="i-heroicons-check" class="text-green-500" />
          <span>{{ item }}</span>
        </li>
      </ul>
    </UCard>
    <UCard class="h-full">
      <template #header>
        <h4 class="font-medium">
          Key Terms
        </h4>
      </template>
      <div class="flex flex-wrap gap-2">
        <UBadge
          v-for="keyword in keywords"
          :key="keyword"
        >
          {{ keyword }}
        </UBadge>
      </div>
    </UCard>
  </div>
</template>
