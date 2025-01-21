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
    <Body class="overscroll-y-none selection:bg-primary font-geist relative overflow-x-hidden bg-white text-black selection:text-inverted dark:bg-neutral-950 dark:text-white">
      <ShelveMeta title="Application" title-template="%s | Shelve" />
      <UApp :tooltip="{ delayDuration: 0 }">
        <Suspense>
          <NuxtLayout>
            <NuxtPage />
          </NuxtLayout>
          <template #fallback>
            <div class="size-full flex flex-col gap-4 items-center justify-center">
              <div class="relative">
                <div class="absolute -z-1 -inset-5 rounded-full border border-neutral-200/60 dark:border-neutral-700/60 animate-ripple-1 opacity-0" />
                <div class="absolute -z-1 -inset-3 rounded-full border border-neutral-200/70 dark:border-neutral-700/70 animate-ripple-2 opacity-0" />
                <div class="absolute -z-1 -inset-1 rounded-full border border-neutral-200/80 dark:border-neutral-700/80 animate-ripple-3 opacity-0" />
                <div class="rounded-full flex items-center justify-center z-10 border-1 border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm dark:shadow-lg">
                  <Icon name="custom:shelve" class="size-8 animate-pulse" />
                </div>
              </div>
            </div>
          </template>
        </Suspense>
        <Toaster close-button position="top-center" />
      </UApp>
    </Body>
  </Html>
</template>
