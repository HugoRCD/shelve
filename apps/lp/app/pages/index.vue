<script setup lang="ts">
useHead({
  title: 'Shelve',
  titleTemplate: 'Shelve',
})

const { data: page } = await useAsyncData('index', () => queryCollection('index').first())
if (!page.value)
  throw createError({ statusCode: 404, message: 'Page not found', fatal: true })
</script>

<template>
  <div v-if="page" class="relative flex flex-col gap-4 overflow-hidden">
    <div id="visitors" class="absolute" />
    <LandingHero :title="page.hero.title" :description="page.hero.description" :links="page.hero.links" />
    <UPageSection
      :description="page.mainSection.description"
      :links="page.mainSection.links"
      orientation="horizontal"
      reverse
      :ui="{
        container: 'sm:pb-0 lg:pb-8',
        title: 'text-xl sm:text-xl lg:text-2xl font-normal',
        description: 'mt-2 text-sm sm:text-md lg:text-sm text-(--ui-text-muted)',
        links: 'mt-4 gap-3'
      }"
    >
      <BgGradient />
      <template #title>
        <ScrambleText :label="page.mainSection.title" class="main-gradient" />
      </template>

      <template #links>
        <Motion
          v-for="(link, index) in page.mainSection.links"
          :key="index"
          as-child
          :initial="{ opacity: 0, transform: 'translateY(20px)' }"
          :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
          :transition="{ delay: 0.2 + 0.2 * index }"
          :in-view-options="{ once: true }"
        >
          <UButton :ui="{ label: 'bg-gradient-to-br from-(--ui-text-muted) to-(--ui-text-highlighted) to-50% bg-clip-text text-transparent' }" v-bind="link" />
        </Motion>
      </template>
      <LandingInstall />
    </UPageSection>
    <UPageSection
      :title="page.envCheck.title"
      :description="page.envCheck.description"
      orientation="horizontal"
      :ui="{
        container: 'sm:pb-0 lg:pb-8',
        title: 'text-xl sm:text-xl lg:text-2xl font-normal',
        description: 'mt-2 text-sm sm:text-md lg:text-sm text-(--ui-text-muted)',
        links: 'mt-4 gap-3'
      }"
    >
      <template #links>
        <Motion
          v-for="(link, index) in page.envCheck.links"
          :key="index"
          as-child
          :initial="{ opacity: 0, transform: 'translateY(20px)' }"
          :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
          :transition="{ delay: 0.2 + 0.2 * index }"
          :in-view-options="{ once: true }"
        >
          <UButton :ui="{ label: 'bg-gradient-to-br from-(--ui-text-muted) to-(--ui-text-highlighted) to-50% bg-clip-text text-transparent' }" v-bind="link" />
        </Motion>
      </template>
      <LandingEnvCheck />
    </UPageSection>
    <LandingFeatures :features="page.features" />
    <UPageSection>
      <LandingStats />
    </UPageSection>
    <UPageSection>
      <LandingFaq :faq="page.faq" />
    </UPageSection>
    <LandingCTA />
  </div>
</template>
