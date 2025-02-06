<script setup lang="ts">
const route = useRoute()

const { data: page } = await useAsyncData('blogPage', () => queryCollection('blogPage').first())

const { data: posts } = await useAsyncData(route.path, () =>
  queryCollection('blog').order('date', 'DESC').all()
)
if (!posts.value) {
  throw createError({ statusCode: 404, statusMessage: `Page not found: ${route.path}`, fatal: true })
}
</script>

<template>
  <div v-if="posts" class="py-20">
    <UPageSection v-bind="page" :ui="{ title: 'text-left font-mono text-gradient', description: 'text-left' }" />
    <USeparator class="mb-12" />
    <UContainer>
      <UBlogPosts orientation="vertical">
        <UBlogPost
          v-for="(post, index) in posts"
          :key="index"
          v-bind="post"
          orientation="horizontal"
          :to="post.path"
        />
      </UBlogPosts>
    </UContainer>
  </div>
</template>
