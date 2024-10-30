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
    <Body class="selection:bg-primary font-geist relative overflow-x-hidden bg-white text-black selection:text-inverted dark:bg-neutral-950 dark:text-white">

    <UApp>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
      <Toaster
        close-button
        position="top-center"
      />
    </UApp>

    </Body>
  </Html>
</template>
