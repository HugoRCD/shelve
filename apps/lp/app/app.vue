<script setup lang="ts">
import { Toaster } from 'vue-sonner'
</script>

<template>
  <Html lang="en">
    <Body class="overscroll-y-none selection:bg-primary font-geist overflow-x-hidden bg-white text-black selection:text-inverted dark:bg-neutral-950 dark:text-white">
      <ShelveMeta />
      <UApp :tooltip="{ delayDuration: 0 }">
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
        <Toaster
          close-button
          position="top-center"
        />
      </UApp>
    </Body>
  </Html>
</template>
