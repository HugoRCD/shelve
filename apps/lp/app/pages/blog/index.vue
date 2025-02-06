<script setup lang="ts">
const route = useRoute()

const blog = await queryCollection('blogPage').first()

const { data: posts } = await useAsyncData(route.path, () =>
  queryCollection('blog').order('date', 'DESC').all()
)
if (!posts.value) {
  throw createError({ statusCode: 404, statusMessage: `Page not found: ${route.path}`, fatal: true })
}
</script>

<template>
  <div v-if="posts" class="py-20">
    <UPageSection v-if="blog" v-bind="blog" />
    <UContainer>
      <div
        v-for="(post, index) in posts"
        :key="index"
        class="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <UBlogPost
          v-bind="post"
          :orientation="index === 0 ? 'horizontal' : 'vertical'"
          :class="[index === 0 && 'col-span-full']"
          :to="post.path"
        />
      </div>
    </UContainer>
  </div>
</template>
