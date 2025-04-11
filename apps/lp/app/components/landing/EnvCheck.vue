<script setup lang="ts">
const checkIconName = 'i-heroicons-check-solid'
const xMarkIconName = 'i-heroicons-x-mark-solid'

const hoveredCardId = ref<number | null>(null)

const cardsData = [
  {
    id: 0,
    variable: 'STRIPE_SECRET_KEY',
    devStatus: 'ok',
    stagingStatus: 'ok',
    prodStatus: 'missing',
    initial: { x: -40, y: 0, z: -80, rx: -6, ry: 15, sk: -3 },
    hover: { y: -15, z: -60, rx: -4, ry: 12, sk: -2 }
  },
  {
    id: 1,
    variable: 'NUXT_PUBLIC_API_URL',
    devStatus: 'ok',
    stagingStatus: 'ok',
    prodStatus: 'ok',
    initial: { x: -20, y: 20, z: -40, rx: -6, ry: 15, sk: -3 },
    hover: { y: 5, z: -20, rx: -4, ry: 12, sk: -2 }
  },
  {
    id: 2,
    variable: 'GITHUB_APP_ID',
    devStatus: 'ok',
    stagingStatus: 'missing',
    prodStatus: 'ok',
    initial: { x: 0, y: 40, z: 0, rx: -6, ry: 15, sk: -3 },
    hover: { y: 25, z: 20, rx: -4, ry: 12, sk: -2 }
  }
]

const getTransform = (card: typeof cardsData[0]) => {
  const isHovered = hoveredCardId.value === card.id

  const { x } = card.initial
  let { y } = card.initial
  let { z } = card.initial
  let { rx } = card.initial
  let { ry } = card.initial
  let { sk } = card.initial

  if (isHovered) {
    ({ y, z, rx, ry, sk } = card.hover)
  }

  return `
    skewY(${sk}deg)
    rotateX(${rx}deg)
    rotateY(${ry}deg)
    translateZ(${z}px)
    translateX(${x}px)
    translateY(${y}px)
  `
}
</script>

<template>
  <div
    class="relative flex items-center justify-center h-72 w-full max-sm:translate-x-8"
    style="perspective: 1200px;"
  >
    <div
      v-for="card in cardsData"
      :key="card.id"
      class="card absolute transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] origin-center
             bg-(--ui-bg)/60 backdrop-blur-lg
             ring-1 ring-(--ui-border)/80 shadow-lg dark:shadow-2xl rounded-lg p-4 w-[320px] h-fit"
      :class="`z-${card.id * 10}`"
      :style="{
        transform: getTransform(card),
        'transform-style': 'preserve-3d',
      }"
      @mouseenter="hoveredCardId = card.id"
      @mouseleave="hoveredCardId = null"
    >
      <p class="font-semibold text-sm truncate">
        {{ card.variable }}
      </p>
      <div class="mt-2 space-y-1 text-sm">
        <div class="flex items-center" :class="card.devStatus === 'ok' ? 'text-(--ui-success)' : 'text-(--ui-error)'">
          <UIcon :name="checkIconName" class="w-4 h-4 mr-1.5 shrink-0" />
          Development
        </div>
        <div class="flex items-center" :class="card.stagingStatus === 'ok' ? 'text-(--ui-success)' : 'text-(--ui-error)'">
          <UIcon :name="card.stagingStatus === 'ok' ? checkIconName : xMarkIconName" class="size-4 mr-1.5 shrink-0" />
          feat/418
        </div>
        <div class="flex items-center" :class="card.prodStatus === 'ok' ? 'text-(--ui-success)' : 'text-(--ui-error)'">
          <UIcon :name="card.prodStatus === 'ok' ? checkIconName : xMarkIconName" class="size-4 mr-1.5 shrink-0" />
          Production
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background-image: radial-gradient(circle at top left, rgba(255, 255, 255, 0.05), transparent 40%);
}
.dark .card {
  background-image: radial-gradient(circle at top left, rgba(255, 255, 255, 0.08), transparent 50%);
}
</style>
