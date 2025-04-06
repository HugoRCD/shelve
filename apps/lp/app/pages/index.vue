<script setup lang="ts">
useHead({
  title: 'Shelve',
  titleTemplate: 'Shelve',
})

const copy = ref(false)

const { data } = await useAsyncData('index', () => {
  return queryCollection('index').first()
})
if (!data.value)
  throw createError({ statusCode: 404, message: 'Page not found', fatal: true })

function useClipboard(text: string) {
  copyToClipboard(text, 'Copied to clipboard')
  copy.value = true
  setTimeout(() => {
    copy.value = false
  }, 1000)
}
</script>

<template>
  <div v-if="data" class="relative flex flex-col gap-4 [--ui-container:75rem]">
    <div id="visitors" class="absolute">
      <!-- active visitors -->
    </div>
    <div class="flex h-full flex-col items-center justify-center gap-3">
      <LandingHero
        class="h-64"
        :title="data.title"
        :description="data.description"
        :cta="data.cta"
      />
    </div>
    <UPageSection orientation="horizontal" :ui="{ container: 'sm:pb-0 lg:pb-8' }">
      <template #leading>
        <div class="text-left">
          <NuxtLink href="https://www.uneed.best/tool/shelve">
            <img src="https://www.uneed.best/EMBED3B.png" alt="Uneed Embed Badge" width="150">
          </NuxtLink>
          <h3 class="main-gradient italic text-2xl mb-2 mt-4">
            <ScrambleText label="> Welcome to Shelve" />
          </h3>
          <p class="text-(--ui-text-muted)">
            Shelve is the best place to manage your projects, alone or with your team. Store your project secrets, data, files and more in one place.
            Use our CLI to manage your projects without leaving your terminal.
          </p>
        </div>
      </template>
      <div class="relative flex items-center justify-center size-full">
        <div class="absolute bottom-16 z-20 flex items-center justify-center [mask-image:linear-gradient(to_bottom,white,transparent)]">
          <div
            class="flex items-center justify-center gap-4 rounded-md bg-(--ui-bg-inverted)/5 px-4 py-2 backdrop-blur-lg"
            @click="useClipboard('npx nypm add -D @shelve/cli')"
          >
            <div class="flex cursor-pointer items-center justify-center gap-2 text-sm text-(--ui-text-muted)">
              <span>
                npx nypm add -D @shelve/cli
              </span>
              <UIcon v-if="!copy" name="lucide:copy" />
              <UIcon v-else name="lucide:check" class="text-(--ui-primary) text-lg" />
            </div>
          </div>
        </div>

        <div class="relative py-40 w-full">
          <div class="absolute inset-0 flex items-center justify-center [mask-image:linear-gradient(to_bottom,white,transparent)]">
            <div class="bg-(--ui-bg-inverted)/2.5 absolute size-96 rounded-full shadow-xl" />

            <div class="bg-(--ui-bg-inverted)/2.5 absolute size-[19rem] rounded-full border border-white/5 shadow-xl" />

            <div class="bg-(--ui-bg-inverted)/2.5 absolute size-56 rounded-full border border-white/10 shadow-xl" />

            <div class="bg-(--ui-bg-inverted)/2.5 absolute size-36 rounded-full border border-dashed border-white/15 shadow-xl" />
          </div>

          <div class="relative flex items-center justify-center">
            <div class="flex size-16 items-center justify-center rounded-full border border-white/10 bg-(--ui-bg-inverted)/2.5 p-3 shadow-md">
              <UIcon name="lucide:lock" class="size-8 text-(--ui-text-muted)" />
            </div>
          </div>
        </div>
      </div>
    </UPageSection>
    <LandingFeatures :features="data.features" />
    <UPageSection>
      <LandingStats />
    </UPageSection>
    <UPageSection>
      <LandingFaq :faq="data.faq" />
    </UPageSection>
  </div>
</template>
