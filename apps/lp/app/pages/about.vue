<script setup lang="ts">
definePageMeta({
  title: 'About',
  description: 'Discover the story behind the project, its origins, and the journey to where we are today.',
  colorMode: 'dark',
})

const { data } = await useAsyncData('about', () => {
  return queryCollection('about').first()
})
</script>

<template>
  <div class="relative overflow-hidden">
    <div class="fixed z-0 inset-0">
      <div class="max-w-5xl w-full mx-auto px-4 h-screen">
        <div class="text-center w-full h-full flex flex-col italic font-mono items-center justify-center">
          <CrossedDiv line>
            <div class="p-8 pointer-events-auto flex flex-col items-center justify-center">
              <ParticlesImg src="/shelve.svg" alt="Shelve Logo" :max-width="200" />
              <ScrambleText class="mt-8 mb-2 main-gradient text-4xl sm:text-5xl" label="About Shelve" />
              <p class="max-w-lg text-center text-xs text-(--ui-text-muted) sm:text-base">
                Discover the story behind the project, its origins, and the journey to where we are today.
              </p>
            </div>
          </CrossedDiv>
        </div>
      </div>
    </div>

    <div class="relative z-0 pointer-events-none">
      <div class="h-screen pointer-events-none" />

      <USeparator />
      <div v-if="data" class="relative w-full pt-10 sm:pt-20 bg-neutral-950 z-10">
        <div v-for="(section, index) in data.about" :key="index" class="group max-w-5xl mx-auto px-4 pointer-events-auto">
          <div class="flex flex-col sm:grid sm:grid-cols-12 gap-16 py-16 group-last:pb-0">
            <div class="col-span-5 relative">
              <ProseImg
                :src="section.image"
                :alt="section.title"
                class="grayscale col-span-12 w-full mix-blend-lighten"
              />
            </div>
            <div class="col-span-7">
              <div class="space-y-3 mb-16">
                <div class="text-(--ui-text-muted) text-center sm:text-left font-mono italic">
                  Part {{ index + 1 < 10 ? '0' + (index + 1) : index + 1 }}
                </div>
                <h2 class="text-4xl sm:text-5xl text-center sm:text-left font-serif italic">
                  {{ section.title }}
                </h2>
                <MDC class="text-sm leading-relaxed text-(--ui-text-muted)" :value="section.content" unwrap="p" />
              </div>
            </div>
            <div class="hidden group-last:flex col-span-12 justify-end bg-neutral-950 mb-16">
              <Signature />
            </div>
          </div>
          <USeparator class="group-last:hidden" />
        </div>
      </div>
    </div>
  </div>
</template>
