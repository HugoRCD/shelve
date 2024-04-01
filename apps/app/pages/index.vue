<script setup lang="ts">
const copy = ref(false)
function copy_to_clipboard(text: string) {
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
    <div class="flex flex-col gap-16 p-5">
      <div>
        <div class="mb-10 flex flex-col items-center justify-center gap-2">
          <h3 class="from-primary-300 to-primary-400 bg-gradient-to-tr bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
            <LandingScrambleText label="Welcome to Shelve" />
          </h3>
          <p class="max-w-lg text-center text-sm text-gray-500 sm:text-base">
            Shelve is the best place to manage your projects, alone or with your team. Store your project secrets, data, files and more in one place.
            Use our CLI to manage your projects without leaving your terminal.
          </p>
        </div>
        <div class="relative">
          <div class="absolute bottom-16 z-20 flex w-full items-center justify-center [mask-image:linear-gradient(to_bottom,white,transparent)]">
            <div
              class="flex items-center justify-center gap-4 rounded-md bg-white/5 px-4 py-2 backdrop-blur-lg"
              @click="copy_to_clipboard('npm install -g @shelve/cli')"
            >
              <div class="flex cursor-pointer items-center justify-center gap-2 text-sm text-gray-300">
                <span>
                  npm install -g @shelve/cli
                </span>
                <span
                  v-if="!copy"
                  class="i-lucide-copy"
                />
                <span
                  v-else
                  class="i-lucide-check text-primary-400 text-lg"
                />
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
                <span class="i-lucide-lock size-8 text-gray-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <LandingFeatures />
      </div>

      <div>
        <LandingFAQ />
      </div>
    </div>
  </div>
</template>
