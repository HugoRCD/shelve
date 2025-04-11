<script setup lang="ts">
defineProps<{
  title: string
  description: string
  cta: string
}>()

const colorMode = useColorMode()

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
      description: 'text-left mt-2 max-w-2xl text-pretty sm:text-md text-(--ui-text-muted)',
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
        <MDC :value="title" class="*:font-normal *:mb-2" />
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
        <div class="flex items-center gap-2">
          <CustomButton label="Start Securing Secrets" />
          <UButton
            label="Read the Docs"
            variant="ghost"
            :ui="{
              label: 'main-gradient'
            }"
            to="/docs/getting-started"
          />
        </div>
      </Motion>
    </template>

    <ClientOnly>
      <video autoplay loop muted class="grayscale absolute opacity-10 top-0 inset-0 scale-105 size-full -z-10 object-cover">
        <source src="/encryption.webm" type="video/webm">
        Your browser does not support the video tag.
      </video>
    </ClientOnly>
    <!--
    <div class="size-60 rounded-full dark:bg-gradient-to-br from-(&#45;&#45;ui-bg-inverted) to-(&#45;&#45;ui-bg-inverted)/50 absolute bottom-0 left-0 right-0 mx-auto -mb-40 blur-[200px] -z-1" />
-->
  </UPageHero>
</template>
