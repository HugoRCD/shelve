<script setup lang="ts">
import type { Collections } from '@nuxt/content'

const props = defineProps<{
  cta: Collections['index']['cta']
}>()

// Utiliser useNuxtApp pour accéder à l'état du SSR
const isHydrating = ref(false)
const nuxtApp = useNuxtApp()
onMounted(() => {
  isHydrating.value = true
})

const userTimeSegment = useCookie('userTimeSegment', {
  maxAge: 60 * 60,
  default: () => getTimeSegment(),
})

function getTimeSegment(): string {
  const currentHour = new Date().getHours()
  if (currentHour >= 6 && currentHour < 12) {
    return 'morning'
  }
  if (currentHour >= 12 && currentHour < 18) {
    return 'afternoon'
  }
  return 'evening'
}

onMounted(() => {
  userTimeSegment.value = getTimeSegment()
})

const headlines: Record<string, string> = props.cta.dynamicTitle

const timeSensitiveHeadline = computed(() => {
  const segment = userTimeSegment.value
  if (segment && headlines[segment]) {
    return headlines[segment]
  }
  return headlines.default
})

const colorMode = useColorMode()
</script>

<template>
  <UPageCTA
    :title="timeSensitiveHeadline"
    :description="cta.description"
    class="relative rounded-none"
    :ui="{ links: 'gap-2' }"
  >
    <div class="absolute bg-stripes inset-0 opacity-30 -z-10" />
    <template #title>
      <ParticlesImg
        :key="colorMode.value"
        src="/shelve.svg"
        alt="Shelve Logo"
        :color="colorMode.value === 'dark' ? '#FFF' : '#000'"
        class="sm:-translate-y-5"
        :width="28"
        :height="12"
        :mouse-force="6"
      />
      <span class="main-gradient">
        {{ timeSensitiveHeadline }}
      </span>
    </template>
    <template #links>
      <CustomButton v-bind="cta.links[0]" />
      <UButton v-bind="cta.links[1]" :ui="{ label: 'bg-gradient-to-br from-(--ui-text-muted) to-(--ui-text-highlighted) to-50% bg-clip-text text-transparent' }" />
    </template>
  </UPageCTA>
</template>
