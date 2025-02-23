<script setup lang="ts">
import type { Collections } from '@nuxt/content'

defineProps<{
  features: Collections['index']['features']
}>()
</script>

<template>
  <div>
    <div class="mb-10 flex flex-col italic items-center justify-center gap-2">
      <h3 class="main-gradient  text-3xl">
        <ScrambleText :label="features.title" />
      </h3>
      <p class="max-w-lg text-pretty text-center text-sm text-(--ui-text-muted) sm:text-base">
        {{ features.description }}
      </p>
    </div>
    <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-y-16">
      <UPageFeature
        v-for="(feature, index) in features.items"
        :key="index"
        orientation="horizontal"
        v-bind="feature"
        :style="{ '--stagger': index + 1 }"
        data-animate
      />
    </div>
  </div>
</template>
