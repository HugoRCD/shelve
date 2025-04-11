<script setup lang="ts">
import type { Collections } from '@nuxt/content'

defineProps<{
  features: Collections['index']['features']
}>()
</script>

<template>
  <UPageSection
    :description="features.description"
    :ui="{
      container: 'sm:pb-0 lg:pb-8',
      title: 'text-xl text-2xl sm:text-3xl lg:text-4xl font-normal',
      description: 'mt-2 sm:text-lg text-(--ui-text-muted)',
      links: 'mt-4 gap-3'
    }"
  >
    <template #title>
      <ScrambleText :label="features.title" class="main-gradient" />
    </template>
    <div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 list-none">
      <Motion
        v-for="(feature, index) in features.features"
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
        :transition="{ delay: 0.1 * features.features.length }"
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
  </UPageSection>
</template>
