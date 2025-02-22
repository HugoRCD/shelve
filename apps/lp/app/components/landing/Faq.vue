<script setup lang="ts">
import type { Collections } from '@nuxt/content'

defineProps<{
  faq: Collections['index']['faq']
}>()
</script>

<template>
  <div id="faq">
    <div class="mb-10 flex italic flex-col items-center justify-center gap-2">
      <h3 class="main-gradient text-3xl">
        <ScrambleText :label="faq.title" />
      </h3>
      <p class="max-w-lg text-center text-sm text-(--ui-text-muted) sm:text-base">
        {{ faq.description }}
      </p>
      <UButton :to="faq.cta.to" :label="faq.cta.label" size="sm" class="mt-2" />
    </div>
    <div>
      <UPageAccordion size="sm" :items="faq.items">
        <template #body="{ item }">
          <MDC :value="item.content" unwrap="p" />
        </template>
      </UPageAccordion>
    </div>
  </div>
</template>
