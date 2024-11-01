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
  <article :id="content.title" class="flex flex-col justify-between gap-4 sm:flex-row sm:gap-8">
    <div class="flex flex-col gap-2">
      <span class="text-nowrap text-neutral-300">
        {{ new Date(content.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }) }}
      </span>
      <UBadge v-if="content.tag" color="blue" variant="subtle">
        {{ content.tag }}
      </UBadge>
    </div>
    <div class="flex flex-col gap-2">
      <img
        :src="content.image"
        :alt="content.title"
        class="h-64 w-full rounded-xl object-cover"
      >
      <ContentRenderer
        :value="content"
        class="prose prose-h2:text-neutral-200"
      />
    </div>
  </article>
</template>
