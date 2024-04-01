<script setup lang="ts">
import type { ParsedContent } from '@nuxt/content/dist/runtime/types'
import type { PropType } from 'vue'

defineProps({
  content: {
    type: Object as PropType<ParsedContent>,
    required: true,
  },
})
</script>

<template>
  <article
    :id="content.title"
    class="border-gray mx-auto flex max-w-3xl flex-col border-t-DEFAULT px-4 py-20 sm:px-6 lg:px-8"
  >
    <img
      :src="content.image"
      :alt="content.title"
      class="w-full"
    >
    <div class="flex items-center gap-3">
      <h1 class="font-main text-primary text-xl font-bold sm:text-3xl">
        {{ content.title }}
      </h1>
    </div>
    <span class="text-muted block text-sm">
      {{ new Date(content.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) }}
    </span>
    <ContentRenderer
      :value="content"
      class="post"
    />
  </article>
</template>

<style scoped>
img {
  @apply mx-auto rounded-xl;
}
</style>
