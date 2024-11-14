<script setup lang="ts">
definePageMeta({
  colorMode: 'dark',
})

useHead({
  title: 'Shelve',
  titleTemplate: 'Shelve',
})

const copy = ref(false)

function useClipboard(text: string) {
  copyToClipboard(text, 'Copied to clipboard')
  copy.value = true
  setTimeout(() => {
    copy.value = false
  }, 1000)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex h-full flex-col items-center justify-center gap-3 p-5">
      <LandingHero class="h-64" />
    </div>
    <div class="mx-auto mt-16 flex max-w-6xl flex-col gap-16 px-8 sm:flex-row sm:gap-8 sm:px-16">
      <div class="flex w-fit flex-col gap-2">
        <NuxtLink
          class="mb-4"
          href="https://www.producthunt.com/posts/shelve?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-shelve"
          target="_blank"
        >
          <img
            src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=534015&theme=neutral"
            alt="Shelve - &#0034;The&#0032;simple&#0032;way&#0032;to&#0032;share&#0032;environment&#0032;variables&#0034; | Product Hunt"
            style="width: 150px;"
          >
        </NuxtLink>
        <h3 class="main-gradient text-2xl">
          <LandingScrambleText label="// Welcome to Shelve" />
        </h3>
        <span class="text-sm text-neutral-500 sm:text-base">
          Shelve is the best place to manage your projects, alone or with your team. Store your project secrets, data, files and more in one place.
          Use our CLI to manage your projects without leaving your terminal.
        </span>
      </div>
      <div class="relative w-full">
        <div class="absolute bottom-16 z-20 flex w-full items-center justify-center [mask-image:linear-gradient(to_bottom,white,transparent)]">
          <div
            class="flex items-center justify-center gap-4 rounded-md bg-white/5 px-4 py-2 backdrop-blur-lg"
            @click="useClipboard('bun a -d @shelve/cli')"
          >
            <div class="flex cursor-pointer items-center justify-center gap-2 text-sm text-neutral-300">
              <span>
                bun a -d @shelve/cli
              </span>
              <UIcon v-if="!copy" name="lucide:copy" />
              <UIcon v-else name="lucide:check" class="text-primary-400 text-lg" />
            </div>
          </div>
        </div>

        <div class="relative -top-12 py-20">
          <div class="absolute inset-0 flex items-center justify-center [mask-image:linear-gradient(to_bottom,white,transparent)]">
            <div class="bg-white/2.5 absolute size-96 rounded-full shadow-xl" />

            <div class="bg-white/2.5 absolute size-[19rem] rounded-full border border-white/5 shadow-xl" />

            <div class="bg-white/2.5 absolute size-56 rounded-full border border-white/10 shadow-xl" />

            <div class="bg-white/2.5 absolute size-36 rounded-full border border-dashed border-white/15 shadow-xl" />
          </div>

          <div class="relative flex items-center justify-center">
            <div class="flex size-16 items-center justify-center rounded-full border border-white/25 bg-white/5 p-3 shadow-xl">
              <UIcon name="lucide:lock" class="size-8 text-neutral-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-16 p-5">
      <div>
        <LandingFeatures />
      </div>

      <div>
        <LandingFaq />
      </div>
    </div>
  </div>
</template>
