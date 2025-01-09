<script setup lang="ts">
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
  <Html>
    <UApp>
      <NuxtLoadingIndicator color="#FFF" />

      <template v-if="!route.path.startsWith('/examples')">
        <!-- <Banner /> -->

        <Header :links />
      </template>

      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>

      <template v-if="!route.path.startsWith('/examples')">
        <ClientOnly>
          <LazyUContentSearch
            v-model:search-term="searchTerm"
            :files
            :navigation
            :fuse="{ resultLimit: 42 }"
          />
        </ClientOnly>
      </template>
    </UApp>
  </Html>
</template>

<style>
@import "tailwindcss";
@import "@nuxt/ui-pro";

@source "../content";

@theme {
  --font-sans: 'Geist', sans-serif;
}

/* Safelist (do not remove): [&>div]:*:my-0 [&>div]:*:w-full */
</style>
