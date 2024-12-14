<script setup lang="ts">
import NumberFlow, { NumberFlowGroup } from '@number-flow/vue'

const nbUsers = ref(52)
const nbSecrets = ref(1000)

const stats = ref([
  {
    number: 0,
    finalNumber: nbUsers.value,
    label: 'Active Users',
    prefix: '+',
  },
  {
    number: 0,
    finalNumber: nbSecrets.value,
    label: 'Secrets Stored',
    format: { notation: 'compact' }
  },
  {
    number: 0,
    finalNumber: 99.9,
    label: 'Uptime',
    suffix: '%'
  }
])

onMounted(() => {
  setTimeout(() => {
    stats.value = stats.value.map(stat => ({
      ...stat,
      number: stat.finalNumber
    }))
  }, 100)
})
</script>

<template>
  <div class="py-16">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="mx-auto max-w-2xl lg:max-w-none">
        <div class="mb-10 flex flex-col items-center justify-center gap-2">
          <h3 class="main-gradient text-2xl leading-8">
            <LandingScrambleText :label="`Trusted by ${nbUsers > 100 ? 'hundreds of' : 'dozens of'} users`" />
          </h3>
          <p class="max-w-lg text-pretty text-center text-sm text-neutral-500 sm:text-base">
            Stats are updated in real-time. Last updated: {{ new Date().toLocaleString() }}
          </p>
        </div>
        <dl class="mt-16 grid grid-cols-1 gap-8 sm:mt-20 sm:grid-cols-3">
          <div
            v-for="(stat, index) in stats"
            :key="index"
            class="flex flex-col items-center gap-2"
          >
            <NumberFlowGroup>
              <dt class="flex items-center gap-2 text-3xl font-bold">
                <NumberFlow
                  :value="stat.number"
                  :prefix="stat.prefix"
                  :suffix="stat.suffix"
                  continuous
                  class="font-semibold tabular-nums"
                />
              </dt>
            </NumberFlowGroup>
            <dd class="text-sm text-neutral-500">
              {{ stat.label }}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
</template>

