<script setup lang="ts">
defineProps<{
  title: string
  description: string
  cta: string
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
  <div class="z-20 h-[400px] w-full bg-dotted sm:p-0 p-5 relative flex items-center justify-center overflow-hidden">
    <div>
      <div class="flex items-center justify-center">
        <Logo :text="false" lp size="size-10" />
      </div>
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
          delay: 0.2
        }"
      >
        <MDC
          :value="title"
          class="mx-auto max-w-md text-pretty text-shadow-sm *:font-normal *:mb-2 text-center text-3xl sm:text-4xl"
        />
      </Motion>

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
          delay: 0.4
        }"
      >
        <p class="mx-auto mt-2 max-w-lg text-center text-(--ui-text-muted) sm:block">
          {{ description }}
        </p>
      </Motion>
      <MDC
        class="mt-4 hidden text-center text-(--ui-text-muted) sm:block"
        :value="cta"
      />
      <div class="mt-4 sm:hidden flex-col items-center justify-center gap-2 flex sm:gap-4">
        <UButton
          to="https://app.shelve.cloud/login"
          label="Start your journey"
          icon="lucide:arrow-right"
          trailing
        />
      </div>
    </div>

    <div class="size-60 rounded-full dark:bg-gradient-to-br from-(--ui-bg-inverted) to-(--ui-bg-inverted)/50 absolute bottom-0 left-0 right-0 mx-auto -mb-40 blur-[200px] -z-1" />
  </div>
</template>
