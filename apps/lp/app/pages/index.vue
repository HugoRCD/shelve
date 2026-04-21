<script setup lang="ts">
import {
  LandingInstall,
  LandingEncryption,
  LandingTokens,
  LandingAuditLogs,
  LandingAgentSafety,
  LandingEnvCheck,
  LandingGithubSync,
  LandingTeams,
  LandingConsole,
} from '#components'

const { title, description, ogImage } = useAppConfig()

const { data: page } = await useAsyncData('index', () => queryCollection('index').first())
if (!page.value)
  throw createError({ statusCode: 404, message: 'Page not found', fatal: true })

const titleTemplate = ref('%s - Effortless secrets management')

useSeoMeta({
  title,
  titleTemplate,
  description,
  ogDescription: description,
  ogTitle: titleTemplate.value?.includes('%s') ? titleTemplate.value.replace('%s', title) : title
})

useSeoMeta({ ogImage: ogImage })

type SectionVisual = Component | null

const sectionVisuals: Record<string, SectionVisual> = {
  secrets: LandingInstall,
  encryption: LandingEncryption,
  tokens: LandingTokens,
  audit: LandingAuditLogs,
  agent: LandingAgentSafety,
  env: LandingEnvCheck,
  github: LandingGithubSync,
  team: LandingTeams,
  console: LandingConsole,
}

function visualFor(id: string | undefined): SectionVisual {
  if (!id) return null
  return sectionVisuals[id] ?? null
}
</script>

<template>
  <div v-if="page" class="relative flex flex-col gap-4 overflow-hidden">
    <LandingHero :title="page.hero.title" :description="page.hero.description" :links="page.hero.links" />

    <div class="relative">
      <BgGradient />
      <UPageSection
        v-for="(section, index) in page.sections"
        :key="section.id ?? index"
        :description="section.description"
        :links="section.links"
        orientation="horizontal"
        :reverse="index % 2 === 0"
        :ui="{
          container: 'sm:pb-0 lg:pb-8',
          title: 'text-xl sm:text-xl lg:text-2xl font-normal',
          description: 'mt-2 text-sm sm:text-md lg:text-sm text-muted',
          links: 'mt-4 gap-3'
        }"
      >
        <template #title>
          <ScrambleText :label="section.title" class="main-gradient" />
        </template>

        <template #links>
          <Motion
            v-for="(link, _index) in section.links"
            :key="_index"
            as-child
            :initial="{ opacity: 0, transform: 'translateY(20px)' }"
            :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
            :transition="{ delay: 0.2 + 0.2 * _index }"
            :in-view-options="{ once: true }"
          >
            <UButton class="cursor-default hover:bg-transparent" :ui="{ label: 'main-gradient' }" v-bind="link" />
          </Motion>
        </template>
        <div class="min-h-[300px] flex items-center justify-center">
          <component :is="visualFor(section.id)" v-if="visualFor(section.id)" />
        </div>
      </UPageSection>
    </div>
    <UPageSection>
      <LandingStats />
    </UPageSection>
    <UPageSection>
      <LandingFaq :faq="page.faq" />
    </UPageSection>
    <LandingCTA :cta="page.cta" />
  </div>
</template>
