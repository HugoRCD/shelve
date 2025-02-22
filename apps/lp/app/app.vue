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

const { data: navigation } = await useAsyncData('navigation', () => {
  return Promise.all([
    queryCollectionNavigation('docs'),
    queryCollectionNavigation('blog')
  ])
}, {
  transform: data => data.flat()
})

const { data: files } = useLazyAsyncData('search', () => {
  return Promise.all([
    queryCollectionSearchSections('docs'),
    queryCollectionSearchSections('blog')
  ])
}, {
  server: false,
  transform: data => data.flat()
})

provide('navigation', navigation)

const defaultOgImage = computed(() => {
  return !route.path.startsWith('/docs/')
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
            :navigation
            :fuse="{ resultLimit: 42 }"
          />
        </ClientOnly>
      </UApp>
    </Body>
  </Html>
</template>
