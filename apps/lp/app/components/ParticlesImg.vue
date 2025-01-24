<script lang="ts" setup>
// @ts-expect-error - This is not typed
import { NextParticle } from '~/assets/scripts/particles.js'

type ParticleProps = {
  // Image source
  src: string
  // Image alt text
  alt?: string
  // Particle color
  color?: string
  // Width of the particle effect
  width?: number
  // Maximum width of the particle effect
  maxWidth?: number
  // Gravity effect on particles
  gravity?: number
  // Mouse force effect on particles
  mouseForce?: number
  // Noise level for particle movement
  noise?: number
  // Gap between particles
  particleGap?: number
  // Additional class names for the image
  imageClass?: string
}

const props = withDefaults(defineProps<ParticleProps>(), {
  color: '#FFF',
  gravity: 0.11,
  mouseForce: 20,
  noise: 4,
  particleGap: 2,
  alt: '',
})

const img = ref()

onMounted(() => {
  // @ts-expect-error - This is not typed
  new NextParticle({
    color: props.color,
    image: img.value,
    width: props.width,
    maxWidth: props.maxWidth,
    gravity: props.gravity,
    mouseForce: props.mouseForce,
    noise: props.noise,
    particleGap: props.particleGap
  })
})
</script>

<template>
  <div>
    <img
      ref="img"
      class="hidden"
      :src
      :alt
    >
  </div>
</template>
