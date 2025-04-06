<script setup lang="ts">
import type { Collections } from '@nuxt/content'

defineProps<{
  features: Collections['index']['features']
}>()
</script>

<template>
  <UContainer class="flex flex-col gap-2">
    <h3 class="main-gradient text-3xl font-normal italic text-center">
      <ScrambleText :label="features.title" />
    </h3>
    <p class="max-w-lg mx-auto text-pretty text-center text-sm text-(--ui-text-muted) italic sm:text-base">
      {{ features.description }}
    </p>
    <div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 list-none">
      <Motion
        v-for="(feature, index) in features.items"
        :key="feature.title"
        as="li"
        :initial="{ opacity: 0, transform: 'translateY(10px)' }"
        :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
        :transition="{ delay: 0.1 * index }"
        :in-view-options="{ once: true }"
      >
        <UPageFeature
          v-bind="feature"
          orientation="vertical"
        />
      </Motion>
      <Motion
        as="li"
        :initial="{ opacity: 0, transform: 'translateY(10px)' }"
        :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
        :transition="{ delay: 0.1 * features.items.length }"
        :in-view-options="{ once: true }"
        class="flex flex-col justify-center gap-4 p-4 bg-(--ui-bg-muted)/50 h-full"
      >
        <span class="text-lg font-semibold">
          Explore everything you can do with Shelve
        </span>
        <UButton
          to="/docs/getting-started"
          size="sm"
          label="Read the docs"
          trailing-icon="lucide:arrow-right"
          class="rounded-none size-fit"
        />
      </Motion>
    </div>
  </UContainer>
</template>
