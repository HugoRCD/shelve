<script setup lang="ts">
import { Toaster } from 'vue-sonner'

useScriptPlausibleAnalytics({
  domain: 'shelve.hrcd.fr',
  scriptInput: {
    src: 'https://analytics.hrcd.fr/js/script.js',
  }
})

const { title, link, description, ogImage } = useAppConfig()
useHead({
  title: title,
  link: link,
})

useSeoMeta({
  title,
  description,
  author: 'Hugo Richard',
  twitter: '@HugoRCD__',
  twitterTitle: title,
  twitterDescription: description,
  twitterCard: 'summary_large_image',
  twitterImage: ogImage,
  ogUrl: 'https://shelve.hrcd.fr',
  ogImage: ogImage,
  ogSiteName: title,
  ogTitle: title,
  ogDescription: description
})

function setPrefersReducedMotion(reduceMotion: boolean) {
  if (reduceMotion) {
    document.documentElement.setAttribute('data-reduce-motion', 'reduce')
  } else {
    document.documentElement.removeAttribute('data-reduce-motion')
  }
}

const reduceMotion = useCookie<boolean>('reduceMotion', {
  watch: true,
})

if (import.meta.client) setPrefersReducedMotion(reduceMotion.value)
</script>

<template>
  <Html lang="en">
    <Body class="selection:bg-primary relative overflow-x-hidden font-geist text-black selection:text-inverted dark:text-white">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
      <Toaster
        close-button
        position="top-center"
      />
    </Body>
  </Html>
</template>
