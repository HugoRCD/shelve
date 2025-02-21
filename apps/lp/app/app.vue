<script setup lang="ts">
import { Toaster } from 'vue-sonner'

useScriptPlausibleAnalytics({
  domain: 'shelve.cloud',
  scriptInput: {
    src: 'https://analytics.hrcd.fr/js/script.js',
  }
})

const route = useRoute()
const searchTerm = ref('')

const { data: docsNavigation } = await useAsyncData('docs-navigation', () => queryCollectionNavigation('docs'))
const { data: blogNavigation } = await useAsyncData('blog-navigation', () => queryCollectionNavigation('blog'))

const { data: files } = useLazyAsyncData('search', () => queryCollectionSearchSections('docs'), {
  server: false
})

provide('docs-navigation', docsNavigation)
provide('blog-navigation', blogNavigation)

const defaultOgImage = computed(() => {
  return route.path === '/' || route.path === '/roadmap' || route.path === '/brand' || route.path === '/about' || route.path === '/blog'
})

const { data, refresh } = useFetch('/llms.txt', {
  immediate: false
})

defineShortcuts({
  meta_shift_m: async () => {
    await refresh()
    copyToClipboard(data.value!, 'llms.txt copied!')
  }
})
</script>

<template>
  <Html lang="en">
    <Body class="overscroll-y-none selection:bg-primary font-geist overflow-x-hidden text-black selection:text-inverted bg-white dark:bg-neutral-950 dark:text-white">
      <ShelveMeta :default-og-image :title="route.meta.title" :description="route.meta.description" />

      <NuxtLoadingIndicator color="#FFF" />

      <UApp :tooltip="{ delayDuration: 0 }">
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>

        <Toaster close-button position="top-center" />
        <ClientOnly>
          <LazyUContentSearch
            v-model:search-term="searchTerm"
            :files
            shortcut="meta_k"
            :navigation="docsNavigation"
            :fuse="{ resultLimit: 42 }"
          />
        </ClientOnly>
      </UApp>
    </Body>
  </Html>
</template>
