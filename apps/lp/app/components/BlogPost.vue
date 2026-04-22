<script setup lang="ts">
import type { Collections } from '@nuxt/content'

const { post, eager = false } = defineProps<{
  post: Collections['blog'],
  to: string
  eager?: boolean
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
      <div class="md:w-1/2 shrink-0 aspect-video overflow-hidden rounded-lg bg-elevated">
        <NuxtImg
          :src="post.image"
          :alt="post.title"
          :loading="eager ? 'eager' : 'lazy'"
          :fetchpriority="eager ? 'high' : 'auto'"
          format="webp"
          width="800"
          height="450"
          sizes="100vw md:600px"
          class="size-full object-cover"
        />
      </div>
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
