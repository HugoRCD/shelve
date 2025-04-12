<script setup lang="ts">
definePageMeta({
  title: 'Blog',
  description: 'Explore our blog to learn more about our latest features, updates, and insights.',
})

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
  <UPage v-if="page && posts">
    <UPageHero
      :description="page.description"
      orientation="horizontal"
      :ui="{
        container: 'py-12 sm:py-16 lg:py-16',
        wrapper: 'lg:w-[600px]',
        title: 'text-left max-w-xl text-pretty',
        description: 'text-left mt-2 text-md max-w-2xl text-pretty sm:text-md text-(--ui-text-muted)',
      }"
    >
      <template #title>
        <h1 class="font-normal main-gradient text-3xl sm:text-4xl lg:text-5xl">
          {{ page.title }}
        </h1>
      </template>
    </UPageHero>
    <Divider />
    <UContainer class="pt-8">
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

      <div v-if="status !== 'pending'" class="flex flex-col gap-4">
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
  </UPage>
</template>
