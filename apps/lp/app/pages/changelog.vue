<script setup lang="ts">
const { data } = await useAsyncData('release', () =>
  queryContent('/release').sort({ date: -1 }).find()
)
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="mt-10 flex h-full flex-col items-center justify-center gap-3 p-5">
      <div class="mb-10 flex flex-col gap-2 text-center">
        <h3 class="from-primary-300 to-primary-400 bg-gradient-to-tr bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
          <LandingScrambleText label="Changelog" />
        </h3>
        <p class="text-sm text-neutral-500 sm:text-base">
          Stay up to date with the latest changes to Shelve.
        </p>
      </div>
    </div>
    <section class="mx-auto flex max-w-5xl flex-col gap-8 border-t border-neutral-700 pt-20">
      <Release
        v-for="(post, index) in data"
        :key="post.slug"
        :content="post"
        data-animate
        :style="{ '--stagger': index }"
      >
        {{ post }}
      </Release>
    </section>
  </div>
</template>
