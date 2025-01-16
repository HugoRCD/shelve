<script setup lang="ts">
import NumberFlow, { NumberFlowGroup } from '@number-flow/vue'

const baseUrl = useRuntimeConfig().public.apiUrl

const { stats } = useStats({ baseUrl })

const finalStats = computed(() => [
  {
    value: stats.value?.users.value ?? 0,
    label: 'Active Users',
  },
  {
    value: stats.value?.variables.value ?? 0,
    label: 'Secrets Stored',
    format: { notation: 'compact' }
  },
  {
    value: stats.value?.teams.value ?? 0,
    label: 'Teams',
    suffix: ''
  },
  {
    value: stats.value?.pull.value ?? 0,
    label: 'Pull',
  },
  {
    value: stats.value?.push.value ?? 0,
    label: 'Push',
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
        <span class="relative flex size-3">
          <span
            class="absolute bg-neutral-50 inline-flex size-full animate-ping rounded-full opacity-75"
          />
          <span
            class="relative bg-neutral-500 inline-flex size-3 scale-90 rounded-full"
          />
        </span>
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
        <NumberFlowGroup>
          <dt class="flex items-center gap-2 text-3xl font-bold">
            <NumberFlow
              :value="stat.value"
              :suffix="stat.suffix"
              continuous
            />
          </dt>
        </NumberFlowGroup>
        <dd class="text-sm text-neutral-500">
          {{ stat.label }}
        </dd>
      </UPageCard>
    </dl>
  </div>
</template>

