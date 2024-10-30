<script setup lang="ts">
definePageMeta({
  colorMode: 'dark',
})

useHead({
  title: 'Documentation'
})
</script>

<template>
  <div class="flex h-72 flex-col items-center justify-center gap-2 py-5">
    <div class="w-full border-y border-gray-500/20">
      <div class="mx-auto max-w-4xl">
        <CrossedDiv encrypted-text>
          <h3 class="main-gradient font-geist-mono text-2xl font-bold sm:text-4xl">
            <LandingScrambleText label="// The documentation is coming soon" />
          </h3>
          <p class="max-w-lg text-sm leading-6 text-gray-300">
            We are working hard to provide you with the best documentation possible.
          </p>
        </CrossedDiv>
      </div>
    </div>
  </div>
</template>
