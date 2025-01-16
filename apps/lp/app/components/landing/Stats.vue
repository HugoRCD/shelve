<script setup lang="ts">
import NumberFlow, { NumberFlowGroup } from '@number-flow/vue'

const baseUrl = useRuntimeConfig().public.apiUrl

const { stats } = useStats({ baseUrl })

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
    value: stats.value?.teams.value ?? undefined,
    label: 'Teams',
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
      <h3 class="main-gradient text-2xl leading-8">
        <LandingScrambleText label="Built for developers" />
      </h3>
      <p class="flex gap-2 items-center text-pretty text-center text-sm text-neutral-500 sm:text-base">
        Stats are updated in real-time
      </p>
    </div>
    <dl class="mt-16 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-3">
      <UPageCard
        v-for="(stat, index) in finalStats"
        :key="index"
        :ui="{
          container: 'sm:p-4 gap-y-0'
        }"
      >
        <div class="flex gap-2 items-center">
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
            :suffix="stat.suffix"
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

