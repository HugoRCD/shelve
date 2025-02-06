<script setup lang="ts">
const route = useRoute()

const blog = await queryCollection('blog').first()

const { data: posts } = await useAsyncData(route.path, () =>
  queryCollection('blogs').order('date', 'DESC').all()
)
if (!posts.value) {
  throw createError({ statusCode: 404, statusMessage: `Page not found: ${route.path}`, fatal: true })
}
</script>

<template>
  <div v-if="posts" class="min-h-screen mt-20">
    <UPageSection v-if="blog" :title="blog.title" :description="blog.description" />
    <UContainer>
      <UBlogPosts>
        <UBlogPost
          v-for="(post, index) in posts"
          :key="index"
          v-bind="post"
          :to="post.path"
        />
      </UBlogPosts>
    </UContainer>
  </div>
</template>

<style scoped>

</style>
