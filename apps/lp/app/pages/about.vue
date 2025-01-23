<script setup lang="ts">
import ParticlesLogo from '~/components/ParticlesLogo.vue'

definePageMeta({
  colorMode: 'dark',
})

const data = await queryCollection('about').first()
</script>

<template>
  <div class="relative">
    <div class="fixed -z-10 inset-0">
      <div class="max-w-5xl mx-auto px-4 h-screen">
        <div class="text-center w-full h-full flex flex-col italic font-mono items-center justify-center">
          <CrossedDiv line>
            <div class="p-8 flex flex-col items-center justify-center">
              <ParticlesLogo />
              <ScrambleText class="mt-8 mb-2 main-gradient text-6xl" label="About Shelve" />
              <p class="max-w-lg text-center text-sm text-neutral-500 sm:text-base">
                Discover the story behind the project, its origins, and the journey to where we are today.
              </p>
            </div>
          </CrossedDiv>
        </div>
      </div>
    </div>

    <div class="relative z-0">
      <div class="h-screen" />

      <div class="relative pt-10 sm:pt-20 bg-neutral-950 z-10">
        <div class=" max-w-5xl mx-auto px-4">
          <div v-for="(section, index) in data.about" :key="index" class="min-h-screen">
            <div class="grid grid-cols-12 gap-16">
              <div class="col-span-5 relative">
                <ProseImg
                  :src="section.image"
                  :alt="section.title"
                  class="grayscale col-span-12 w-full"
                />
              </div>
              <div class="col-span-7">
                <div class="space-y-3 mb-16">
                  <div class="text-gray-500 font-mono italic">
                    Part {{ index + 1 < 10 ? '0' + (index + 1) : index + 1 }}
                  </div>
                  <h2 class="text-5xl font-serif italic">
                    {{ section.title }}
                  </h2>
                  <MDC class="leading-relaxed text-neutral-400" :value="section.content" unwrap="p" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
