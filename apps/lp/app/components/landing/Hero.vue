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
    :ui="{
      container: 'py-18 sm:py-24 lg:py-32',
      title: 'text-left max-w-xl text-pretty',
      description: 'text-left mt-2 text-md max-w-2xl text-pretty sm:text-md text-(--ui-text-muted)',
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
          <CustomButton :label="links[0]?.label" />
          <UButton :ui="{ label: 'main-gradient' }" v-bind="links[1]" />
        </div>
      </Motion>
    </template>

    <ClientOnly>
      <video autoplay loop muted class="invert dark:invert-0 grayscale absolute opacity-20 top-0 inset-0 scale-110 size-full -z-10 object-cover transform translate-x-1/2">
        <source src="/encryption.webm" type="video/webm">
        Your browser does not support the video tag.
      </video>
    </ClientOnly>
  </UPageHero>
</template>
