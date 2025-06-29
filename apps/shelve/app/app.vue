<script setup lang="ts">
import { SpeedInsights } from '@vercel/speed-insights/nuxt'
import { Analytics } from '@vercel/analytics/nuxt'
import { MotionGlobalConfig } from 'motion-v'
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'

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
      <SpeedInsights />
      <Analytics />
      <ShelveMeta title="Application" />
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
