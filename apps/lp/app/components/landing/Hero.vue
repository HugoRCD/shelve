<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'

defineProps<{
  title: string
  description: string
  links?: ButtonProps[]
}>()

defineShortcuts({
  s: {
    usingInput: true,
    handler: () => {
      navigateTo(`https://app.shelve.cloud/login`, { external: true })
    }
  }
})
</script>

<template>
  <UPageHero
    orientation="horizontal"
    :ui="{
      container: 'py-18 sm:py-24 lg:py-32',
      wrapper: 'lg:w-[600px]',
      title: 'text-left max-w-xl text-pretty',
      description: 'text-left mt-2 text-md max-w-2xl text-pretty sm:text-md text-muted',
      links: 'mt-4 justify-start'
    }"
  >
    <template #title>
      <Motion
        :initial="{
          scale: 1.1,
          opacity: 0,
          filter: 'blur(20px)'
        }"
        :animate="{
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)'
        }"
        :transition="{
          duration: 0.6,
          delay: 0.1
        }"
      >
        <h1 class="font-normal main-gradient text-3xl sm:text-4xl lg:text-5xl">
          {{ title }}
        </h1>
      </Motion>
    </template>

    <template #description>
      <Motion
        :initial="{
          scale: 1.1,
          opacity: 0,
          filter: 'blur(20px)'
        }"
        :animate="{
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)'
        }"
        :transition="{
          duration: 0.6,
          delay: 0.3
        }"
      >
        {{ description }}
      </Motion>
    </template>

    <template #links>
      <Motion
        :initial="{
          scale: 1.1,
          opacity: 0,
          filter: 'blur(20px)'
        }"
        :animate="{
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)'
        }"
        :transition="{
          duration: 0.6,
          delay: 0.5
        }"
      >
        <div v-if="links" class="flex items-center gap-2">
          <CustomButton :label="links[0]?.label" :to="links[0]?.to" />
          <UButton :ui="{ label: 'main-gradient' }" v-bind="links[1]" />
        </div>
      </Motion>
    </template>

    <ClientOnly>
      <div class="hidden lg:dark:block grayscale invert dark:invert-0 size-full -z-10 pointer-events-none">
        <div class="video-logo-container size-full">
          <video autoplay loop muted class="size-full object-contain scale-200">
            <source src="/encryption.webm" type="video/webm">
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
      <div class="max-sm:hidden max-sm:dark:hidden lg:hidden absolute inset-0 pointer-events-none">
        <video autoplay loop muted class="invert dark:invert-0 grayscale absolute opacity-20 scale-110 size-full -z-10 object-cover transform translate-x-1/2">
          <source src="/encryption.webm" type="video/webm">
          Your browser does not support the video tag.
        </video>
      </div>
      <div class="max-sm:hidden dark:hidden pointer-events-none">
        <video autoplay loop muted class="invert dark:invert-0 grayscale absolute opacity-20 top-0 inset-0 scale-110 size-full -z-10 object-cover transform translate-x-1/2">
          <source src="/encryption.webm" type="video/webm">
          Your browser does not support the video tag.
        </video>
      </div>
    </ClientOnly>
  </UPageHero>
</template>

<style>
.video-logo-container {
  -webkit-mask-image: url('/shelve.svg');
  mask-image: url('/shelve.svg');
  -webkit-mask-size: auto auto;
  mask-size: auto auto;
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}

@media (prefers-color-scheme: dark) {
  .video-logo-mask video {
    filter: brightness(1.5) contrast(1.2);
  }
}

@media (prefers-color-scheme: light) {
  .video-logo-mask video {
    filter: invert(1) brightness(1.5) contrast(1.2);
  }
}
</style>
