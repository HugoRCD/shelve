<script setup lang="ts">
import type { Collections } from '@nuxt/content'

const { post } = defineProps<{
  post: Collections['blog'],
  to: string
}>()

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <article class="p-4 cursor-pointer rounded-lg relative hover:bg-muted/10 transition-colors duration-200">
    <NuxtLink :to class="absolute inset-0" />
    <div class="flex md:flex-row flex-col gap-4 sm:gap-6">
      <NuxtImg
        :src="post.image"
        :alt="post.title"
        loading="lazy"
        format="webp"
        class="md:max-w-1/2 aspect-video object-cover rounded-lg"
      />
      <div class="flex flex-col justify-around gap-1">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-medium text-muted">
            {{ formatDate(post.date) }}
          </span>
          <h2 class="text-xl font-bold text-primary">
            {{ post.title }}
          </h2>
          <p class="text-muted">
            {{ post.description }}
          </p>
        </div>
        <div class="flex items-center gap-2 mt-2">
          <UUser
            v-for="(author, index) in post.authors"
            :key="index"
            color="neutral"
            variant="outline"
            v-bind="author"
          />
        </div>
      </div>
    </div>
  </article>
</template>
