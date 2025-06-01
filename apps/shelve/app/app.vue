<script setup lang="ts">
import { MotionGlobalConfig } from 'motion-v'
import { Toaster } from 'vue-sonner'

const reduceMotion = useCookie<boolean>('reduceMotion', {
  watch: true,
})

MotionGlobalConfig.skipAnimations = reduceMotion.value

watch(reduceMotion, (value) => {
  MotionGlobalConfig.skipAnimations = value
})
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
