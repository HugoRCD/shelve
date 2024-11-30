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
    <div class="w-full border-y border-neutral-500/20">
      <div class="mx-auto max-w-4xl">
        <EncryptDiv encrypted-text>
          <h3 class="main-gradient font-geist-mono text-2xl sm:text-3xl">
            <LandingScrambleText label="// The documentation is coming soon" />
          </h3>
          <p class="max-w-lg text-sm leading-6 text-neutral-500">
            We are working hard to provide you with the best documentation possible.
          </p>
        </EncryptDiv>
      </div>
    </div>
  </div>
</template>
