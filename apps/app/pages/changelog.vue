<script setup lang="ts">
const { data } = await useAsyncData('release', () =>
  queryContent('/release').sort({ date: -1 }).find()
)
</script>

<template>
  <div>
    <section
      class="markdown relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8"
    >
      <Release
        v-for="(post, index) in data"
        :key="post.slug"
        :content="post"
        data-animate
        :style="{ '--stagger': index }"
      >
        {{ post }}
      </Release>
    </section>
  </div>
</template>

<style scoped>
.markdown {
  @apply prose max-w-none;
  @apply prose-h1:text-2xl prose-h1:font-bold prose-h1:text-primary;
  @apply prose-h2:text-xl prose-h2:font-medium prose-h2:text-primary prose-h2:mt-8 prose-h2:mb-4;
  @apply prose-h3:text-lg prose-h3:font-medium prose-h3:text-primary prose-h3:mt-8 prose-h3:mb-4;
  @apply prose-p:font-light;
  @apply prose-a:font-semibold prose-a:text-accent prose-a:no-underline hover:prose-a:underline;
  @apply prose-ul:font-light prose-ul:leading-5;
}
</style>
