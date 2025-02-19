<script setup lang="ts">
const { do: doGuidelines, dont: dontGuidelines } = defineProps<{
  do: string[]
  dont: string[]
}>()
</script>

<template>
  <UPageCard variant="outline" class="bg-transparent" :ui="{ container: 'grid lg:grid-cols-2 gap-6' }">
    <div class="space-y-4 text-sm">
      <h4 class="font-medium text-(--ui-success)">
        Do's
      </h4>
      <ul class="space-y-2">
        <li
          v-for="item in doGuidelines"
          :key="item"
          class="flex items-center gap-2"
        >
          <UIcon name="i-lucide-check-circle" class="text-green-500" />
          <span>{{ item }}</span>
        </li>
      </ul>
    </div>
    <div class="space-y-4 text-sm">
      <h4 class="font-medium text-(--ui-error)">
        Don'ts
      </h4>
      <ul class="space-y-2">
        <li
          v-for="item in dontGuidelines"
          :key="item"
          class="flex items-center gap-2"
        >
          <UIcon name="i-heroicons-x-circle" class="text-(--ui-error)" />
          <span>{{ item }}</span>
        </li>
      </ul>
    </div>
  </UPageCard>
</template>
