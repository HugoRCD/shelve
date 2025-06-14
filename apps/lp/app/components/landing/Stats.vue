<script setup lang="ts">
import NumberFlow from '@number-flow/vue'

const loadingDots = ref('.')
const loadingInterval = ref<number | null>(null)

onMounted(() => {
  loadingInterval.value = setInterval(() => {
    loadingDots.value = loadingDots.value.length >= 3
      ? '.'
      : `${loadingDots.value }.`
  }, 500) as unknown as number
})

onUnmounted(() => {
  if (loadingInterval.value) {
    clearInterval(loadingInterval.value)
  }
})

const baseUrl = useRuntimeConfig().public.apiUrl

const { stats, isLoading } = useStats({ baseUrl })

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
    <div class="mb-10 flex flex-col gap-2">
      <h3 class="main-gradient text-3xl leading-8">
        <ScrambleText label="Real-time Impact" />
      </h3>
      <p class="flex gap-2 items-center text-pretty text-center text-muted">
        {{ !isLoading ? `Live insights into Shelve's usage and efficiency.` : `Loading stats${loadingDots}` }}
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
        <div class="flex gap-2 items-center">
          <span class="relative flex size-2">
            <span
              class="absolute bg-inverted inline-flex size-full animate-ping rounded-full opacity-75"
            />
            <span
              class="relative bg-inverted inline-flex size-2 scale-90 rounded-full"
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
        <dd class="text-sm font-mono text-muted">
          {{ stat.label }}
        </dd>
      </UPageCard>
    </dl>
    <span class="text-xs text-muted text-center mt-4 block">
      Saved time is calculated by comparing manual env file sharing (5min) vs Shelve operations (5s).
    </span>
  </div>
</template>

