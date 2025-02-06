<script setup lang="ts">
const route = useRoute()

const { data: page } = await useAsyncData('blogPage', () => queryCollection('blogPage').first())

const { data: posts, status } = await useAsyncData(route.path, () =>
  queryCollection('blog').order('date', 'DESC').all()
)

const active = ref('all')

const tags = computed(() => {
  const allTags = posts.value?.flatMap(post => post.tags) || []
  const uniqueTags = [...new Set(allTags)]
  return [
    'all',
    ...uniqueTags.map(tag =>
      tag.toLowerCase().replace(/^\w/, c => c.toUpperCase())
    )
  ]
})

const filteredPosts = computed(() => {
  if (active.value === 'all') return posts.value
  return posts.value?.filter(post =>
    post.tags?.some(tag =>
      tag.toLowerCase() === active.value.toLowerCase()
    )
  )
})

if (!posts.value) {
  throw createError({ statusCode: 404, statusMessage: `Page not found: ${route.path}`, fatal: true })
}
</script>

<template>
  <div v-if="posts" class="py-20">
    <UPageSection v-bind="page" :ui="{ title: 'text-left font-mono text-gradient', description: 'text-left mb-0' }" />
    <USeparator class="mb-8" />
    <UContainer>
      <div class="flex flex-wrap gap-3 mb-6">
        <UButton
          v-for="tag in tags"
          :key="tag"
          size="sm"
          :label="tag === 'all' ? 'All' : tag"
          :variant="active === tag ? 'solid' : 'soft'"
          class="transition-all duration-200 capitalize"
          @click="active = tag"
        />
      </div>

      <div v-if="status !== 'pending'" class="flex flex-col">
        <BlogPost
          v-for="(post, index) in filteredPosts"
          :key="index"
          :post
          :to="post.path"
        />
      </div>
      <div v-else class="flex h-64 flex-col items-center justify-center gap-2">
        <USkeleton v-for="i in 4" :key="i" class="h-32" />
      </div>
    </UContainer>
  </div>
</template>
