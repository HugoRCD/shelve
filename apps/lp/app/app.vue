<script setup lang="ts">
import colors from 'tailwindcss/colors'
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'

const appConfig = useAppConfig()
const colorMode = useColorMode()
const color = computed(() => colorMode.value === 'dark' ? (colors as any)[appConfig.ui.colors.neutral][950] : 'white')

useHead({
  link: appConfig.link,
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color }
  ]
})

useScriptPlausibleAnalytics({
  domain: 'shelve.cloud',
  scriptInput: {
    src: 'https://analytics.hrcd.fr/js/script.js',
  }
})

const [{ data: navigation }, { data: files }] = await Promise.all([
  useAsyncData('navigation', () => {
    return Promise.all([
      queryCollectionNavigation('docs'),
      queryCollectionNavigation('blog')
    ])
  }, {
    transform: data => data.flat()
  }),
  useLazyAsyncData('search', () => {
    return Promise.all([
      queryCollectionSearchSections('docs'),
      queryCollectionSearchSections('blog')
    ])
  }, {
    server: false,
    transform: data => data.flat()
  })
])

const links = computed(() => [
  ...navigation.value!.map(item => ({
    label: item.title,
    icon: item.icon,
    to: item.path === '/docs' ? '/docs/getting-started' : item.path
  })),
  {
    label: 'Application',
    to: 'https://app.shelve.cloud',
    target: '_blank',
    icon: 'custom:shelve'
  },
  {
    label: '@shelvecloud',
    to: 'https://x.com/shelvecloud',
    target: '_blank',
    icon: 'i-simple-icons-x'
  },
  {
    label: '@hugorcd',
    to: 'https://x.com/hugorcd',
    target: '_blank',
    icon: 'i-simple-icons-x'
  }
])

provide('navigation', navigation!)

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
    <Body class="overscroll-y-none selection:bg-primary overflow-x-hidden selection:text-inverted">
      <NuxtLoadingIndicator color="#FFF" />

      <UApp :tooltip="{ delayDuration: 0 }">
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>

        <Toaster close-button position="top-center" />
        <ClientOnly>
          <LazyUContentSearch :files :links :navigation shortcut="meta_k" :fuse="{ resultLimit: 42 }" />
        </ClientOnly>
      </UApp>
    </Body>
  </Html>
</template>
