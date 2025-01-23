<script lang="ts" setup>
// @ts-expect-error - This is not typed
import { NextParticle } from '~/assets/scripts/particles.js'

const logo = ref()

onMounted(() => {
  // @ts-expect-error - This is not typed
  new NextParticle({
    color: '#FFF',
    image: logo.value,
    width: 800,
    maxWidth: 500,
    gravity: 0.11,
    mouseForce: 20,
    noise: 4,
    particleGap: 2
  })
})
</script>

<template>
  <div>
    <img
      ref="logo"
      src="~/assets/icons/shelve.svg"
      class="hidden"
      alt="Shelve Logo"
    >
  </div>
</template>
