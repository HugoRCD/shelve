<script setup lang="ts">
import NumberFlow from '@number-flow/vue'

const loadingDots = ref('.')
const loadingInterval = ref<number | null>(null)

onMounted(() => {
  loadingInterval.value = setInterval(() => {
    loadingDots.value = loadingDots.value.length >= 3
      ? '.'
      : loadingDots.value + '.'
  }, 500) as unknown as number
})

onUnmounted(() => {
  if (loadingInterval.value) {
    clearInterval(loadingInterval.value)
  }
})

const baseUrl = useRuntimeConfig().public.apiUrl

const { stats, isLoading, initialFetch } = useStats({ baseUrl })
initialFetch()

const { visitors } = useVisitors()

const finalStats = computed(() => [
  {
    value: stats.value?.users.value ?? undefined,
    label: 'Users',
  },
  {
    value: stats.value?.variables.value ?? undefined,
    label: 'Secrets Stored',
    format: { notation: 'compact' }
  },
  {
    value: stats.value?.projects.value ?? undefined,
    label: 'Projects',
    suffix: ''
  },
  {
    value: stats.value?.pull.value ?? undefined,
    label: 'Pull',
  },
  {
    value: stats.value?.push.value ?? undefined,
    label: 'Push',
  },
  {
    value: stats.value?.savedTime.hours ?? undefined,
    label: 'Saved Time',
    suffix: 'h'
  }
])
</script>

<template>
  <div>
    <ClientOnly>
      <Teleport defer to="#visitors">
        <div class="fixed z-[999] text-neutral-500 text-xs flex gap-2 items-center justify-center bottom-2 left-0 w-full">
          <span class="relative flex size-2">
            <span
              class="absolute bg-green-50 inline-flex size-full animate-ping rounded-full opacity-75"
            />
            <span
              class="relative bg-green-500 inline-flex size-2 scale-90 rounded-full"
            />
          </span>
          <span>
            Active visitors:
          </span>
          <NumberFlow
            class="text-sm font-bold font-mono"
            :value="visitors ?? 0"
            continuous
            will-change
          />
        </div>
      </Teleport>
    </ClientOnly>

    <div class="mb-10 flex flex-col gap-2">
      <h3 class="main-gradient italic text-3xl leading-8">
        <ScrambleText label="Built for speed" />
      </h3>
      <p class="flex gap-2 italic items-center text-pretty text-center text-neutral-500">
        {{ !isLoading ? ' Stats are updated in real-time.' : `Loading stats${loadingDots}` }}
      </p>
    </div>
    <dl class="mt-16 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-3">
      <UPageCard
        v-for="(stat, index) in finalStats"
        :key="index"
        :ui="{
          container: 'sm:p-4 gap-y-0 overflow-hidden'
        }"
        class="overflow-hidden"
      >
        <div class="noise flex gap-2 items-center">
          <span class="relative flex size-2">
            <span
              class="absolute bg-neutral-50 inline-flex size-full animate-ping rounded-full opacity-75"
            />
            <span
              class="relative bg-neutral-500 inline-flex size-2 scale-90 rounded-full"
            />
          </span>
          <NumberFlow
            class="text-3xl font-bold font-mono"
            :value="stat.value ?? 'Infinity'"
            :suffix="stat.value ? stat.suffix : ''"
            continuous
            will-change
          />
        </div>
        <dd class="text-sm font-mono text-neutral-500">
          {{ stat.label }}
        </dd>
      </UPageCard>
    </dl>
    <span class="text-xs text-neutral-500 text-center mt-4 block">
      Saved time is calculated by comparing manual env file sharing (5min) vs Shelve operations (5s).
    </span>
  </div>
</template>

