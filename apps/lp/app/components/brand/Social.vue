<script setup lang="ts">
defineProps<{
  platforms: Array<{
    logo: string
    handle: string
    link: string
    usage: string
  }>
}>()
</script>

<template>
  <div class="grid gap-4">
    <UPageCard
      v-for="platform in platforms"
      :key="platform.name"
      class="flex items-center justify-between overflow-hidden"
      :to="platform.link"
      :ui="{ container: 'noise' }"
    >
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <UIcon
            :name="`i-simple-icons-${platform.logo}`"
            class="size-5"
          />
          <span class="text-(--ui-primary) hover:underline font-medium">
            {{ platform.handle }}
          </span>
        </div>
        <p class="text-sm text-(--ui-text-muted)">
          {{ platform.usage }}
        </p>
      </div>
    </UPageCard>
  </div>
</template>
