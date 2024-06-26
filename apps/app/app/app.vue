<script setup lang="ts">
import { Toaster } from 'vue-sonner'

const { title, link } = useAppConfig()
useHead({
  title: title,
  link: link,
  script: [
    {
      src: 'https://plausible.hrcd.fr/js/script.js',
      defer: true,
      'data-domain': 'shelve.hrcd.fr'
    },
  ],
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


useSession().refresh()
</script>

<template>
  <Html>
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

