<script setup lang="ts">
const { title, link, description, ogImage } = useAppConfig()

useHead({
  title: title,
  link: link,
})

useSeoMeta({
  title,
  description,
  author: 'Hugo Richard',
  twitterCreator: '@HugoRCD__',
  twitterTitle: title,
  twitterDescription: description,
  twitterCard: 'summary_large_image',
  twitterImage: ogImage,
  ogUrl: 'https://shelve.cloud',
  ogImage: ogImage,
  ogSiteName: title,
  ogTitle: title,
  ogDescription: description
})
</script>

<template>
  <div>
    <slot />
  </div>
</template>

<style scoped>

</style>
