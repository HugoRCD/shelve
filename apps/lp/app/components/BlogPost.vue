<script setup lang="ts">
import type { Collections } from '@nuxt/content'

const { post } = defineProps<{
  post: Collections['blog'],
  to: string
}>()

const router = useRouter()

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <CrossedDiv as="article" class="group p-4 cursor-pointer border border-(--ui-border) rounded-lg relative">
    <NuxtLink :to class="absolute inset-0" />
    <div class="flex md:flex-row flex-col gap-4 sm:gap-6">
      <NuxtImg
        :src="post.image"
        :alt="post.title"
        loading="lazy"
        format="webp"
        class="md:max-w-1/2 aspect-video rounded-lg object-cover group-hover:scale-105 transition-all duration-200"
      />
      <div class="flex flex-col justify-around gap-1">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-medium text-(--ui-text-muted)">
            {{ formatDate(post.date) }}
          </span>
          <h2 class="text-xl font-bold text-(--ui-primary)">
            {{ post.title }}
          </h2>
          <p class="text-(--ui-text-muted)">
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
  </CrossedDiv>
</template>
