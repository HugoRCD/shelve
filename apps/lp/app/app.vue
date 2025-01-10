<script setup lang="ts">
import { Toaster } from 'vue-sonner'

useScriptPlausibleAnalytics({
  domain: 'shelve.cloud',
  scriptInput: {
    src: 'https://analytics.hrcd.fr/js/script.js',
  }
})

const route = useRoute()

const { data: navigation } = await useAsyncData('navigation', () => queryCollectionNavigation('content'))

const { data: files } = useLazyAsyncData('search', () => queryCollectionSearchSections('content'), {
  server: false
})
const searchTerm = ref('')

const links = computed(() => [
  /*{
    label: 'Docs',
    icon: 'i-lucide-square-play',
    to: '/getting-started',
    active: route.path.startsWith('/getting-started')
  }*/
])

provide('navigation', navigation)
</script>

<template>
  <Html lang="en">
    <Body class="overscroll-y-none selection:bg-primary font-geist overflow-x-hidden text-black selection:text-inverted bg-white dark:bg-neutral-950 dark:text-white">
      <ShelveMeta />

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
