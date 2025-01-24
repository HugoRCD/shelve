<script lang="ts" setup>
// @ts-expect-error - This is not typed
import { NextParticle } from '~/assets/scripts/particles.js'

type ParticleProps = {
  src: string
  alt?: string
  color?: string
  width?: number
  height?: number
  mobileWidth?: number
  mobileHeight?: number
  gravity?: number
  mouseForce?: number
  noise?: number
  particleGap?: number
  imageClass?: string
}

const props = withDefaults(defineProps<ParticleProps>(), {
  color: '#FFF',
  gravity: 0.11,
  mouseForce: 20,
  noise: 4,
  particleGap: 2,
  alt: '',
  width: 400,
  height: 150,
  mobileWidth: 200,
  mobileHeight: 100,
})

const img = ref()
const particleInstance = ref()

const isMobile = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

const updateParticleSize = () => {
  if (!particleInstance.value) return

  const width = isMobile.value ? props.mobileWidth : props.width
  const height = isMobile.value ? props.mobileHeight : props.height

  particleInstance.value.width = width
  particleInstance.value.height = height
  particleInstance.value.start()
}

onMounted(() => {
  checkMobile()

  // @ts-expect-error - This is not typed
  particleInstance.value = new NextParticle({
    color: props.color,
    image: img.value,
    width: isMobile.value ? props.mobileWidth : props.width,
    height: isMobile.value ? props.mobileHeight : props.height,
    gravity: props.gravity,
    mouseForce: props.mouseForce,
    noise: props.noise,
    particleGap: props.particleGap
  })

  window.addEventListener('resize', () => {
    const wasMobile = isMobile.value
    checkMobile()
    if (wasMobile !== isMobile.value) {
      updateParticleSize()
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<template>
  <div class="particle-container">
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
  width: fit-content;
  margin: 0 auto;
}
</style>
