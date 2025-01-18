<script setup lang="ts">
const { title: appTitle, link, description: appDescription, ogImage } = useAppConfig()

const props = withDefaults(defineProps<{
  defaultOgImage?: boolean,
  title?: string,
  description?: string,
}>(), {
  defaultOgImage: true
})

useHead({
  title: props.title || appTitle,
  titleTemplate: `%s | ${appTitle}`,
  link: link,
})

const seoMetadata = ref({
  title: props.title || appTitle,
  description: props.description || appDescription,
  author: 'Hugo Richard',
  twitterCreator: '@HugoRCD__',
  twitterTitle: props.title || appTitle,
  twitterDescription: props.description || appDescription,
  twitterCard: 'summary_large_image',
  ogUrl: 'https://shelve.cloud',
  ogSiteName: props.title || appTitle,
  ogTitle: props.title || appTitle,
  ogDescription: props.description || appDescription,
})

if (props.defaultOgImage) {
  seoMetadata.value.twitterImage = ogImage
  seoMetadata.value.ogImage = ogImage
}

useSeoMeta(seoMetadata.value)
</script>

<template>
  <div>
    <slot />
  </div>
</template>
