<script setup lang="ts">
import { Toaster } from 'vue-sonner'

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
    <Body class="overscroll-y-none selection:bg-primary relative overflow-x-hidden selection:text-inverted">
      <ShelveMeta title="Application" title-template="%s | Shelve" />
      <MotionConfig :reduce-motion="reduceMotion ? 'always' : 'never'">
        <UApp :tooltip="{ delayDuration: 0 }">
          <Suspense>
            <NuxtLayout>
              <NuxtPage />
            </NuxtLayout>
            <template #fallback>
              <RippleLoader />
            </template>
          </Suspense>
          <Toaster close-button position="top-center" />
        </UApp>
      </MotionConfig>
    </Body>
  </Html>
</template>
