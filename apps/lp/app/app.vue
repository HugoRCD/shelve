<script setup lang="ts">
import { Toaster } from 'vue-sonner'

useScriptPlausibleAnalytics({
  domain: 'shelve.cloud',
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
  <Html lang="en">
    <Body class="selection:bg-primary font-geist relative overflow-x-hidden bg-white text-black selection:text-inverted dark:bg-neutral-950 dark:text-white">
      <UApp :tooltip="{ delayDuration: 0 }">
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
