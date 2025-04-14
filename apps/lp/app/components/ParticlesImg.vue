<script lang="ts" setup>
// @ts-expect-error - This is not typed
import { NextParticle } from '~/assets/scripts/particles.js'

type ParticleProps = {
  src: string
  alt?: string
  color?: string
  width?: number
  height?: number
  gravity?: number
  mouseForce?: number
  noise?: number
  particleGap?: number
}

const props = withDefaults(defineProps<ParticleProps>(), {
  color: '#FFF',
  gravity: 0.11,
  mouseForce: 20,
  noise: 4,
  particleGap: 2,
  alt: '',
  width: 64,
  height: 32,
})

const img = ref()
const particleContainer = ref()
const particleInstance = ref()

const pxWidth = computed(() => props.width * 4)
const pxHeight = computed(() => props.height * 4)

const initParticles = () => {
  if (!img.value || !img.value.complete) return

  // @ts-expect-error - This is not typed
  particleInstance.value = new NextParticle({
    color: props.color,
    image: img.value,
    width: pxWidth.value,
    height: pxHeight.value,
    gravity: props.gravity,
    mouseForce: props.mouseForce,
    noise: props.noise,
    particleGap: props.particleGap
  })
}

const handleResize = () => {
  if (!particleInstance.value) return

  particleInstance.value.width = pxWidth.value
  particleInstance.value.height = pxHeight.value

  if (typeof particleInstance.value.start === 'function') {
    particleInstance.value.start()
  }
}

onMounted(() => {
  if (img.value) {
    if (img.value.complete) {
      initParticles()
    } else {
      img.value.onload = initParticles
    }
  }

  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)

  if (particleInstance.value && typeof particleInstance.value.destroy === 'function') {
    try {
      particleInstance.value.destroy()
    } catch (e) {
      particleInstance.value = null
    }
  }
})
</script>

<template>
  <div
    ref="particleContainer"
    class="particle-container"
    :style="{
      width: `${pxWidth}px`,
      height: `${pxHeight}px`
    }"
  >
    <img
      ref="img"
      class="hidden"
      :src
      :alt
    >
  </div>
</template>

<style scoped>
.particle-container {
  position: relative;
  margin: 0 auto;
}

.hidden {
  display: none;
}

@media (max-width: 768px) {
  .particle-container {
    transform: scale(0.7);
    transform-origin: center center;
  }
}

@media (max-width: 480px) {
  .particle-container {
    transform: scale(0.7);
  }
}
</style>
