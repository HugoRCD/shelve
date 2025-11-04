<script setup lang="ts">
import {
  Shader,
  Blob,
  DotGrid
} from 'shaders/vue'
import { useMotionValue, animate, motion, AnimatePresence } from 'motion-v'

const blobSize = useMotionValue(1.05)
const size = ref(1.05)

blobSize.on('change', (latest) => {
  size.value = latest
})

onMounted(() => {
  setTimeout(() => {
    animate(blobSize, 0.8, {
      duration: 3,
      ease: [0.25, 0.1, 0.25, 1]
    })
  }, 200)
})
</script>

<template>
  <AnimatePresence>
    <motion.div
      key="ai-overlay"
      class="fixed inset-0 z-0 pointer-events-none"
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
      :exit="{ opacity: 0 }"
      :transition="{ duration: 3, ease: [0.25, 0.1, 0.25, 1] }"
    >
      <Shader class="size-full">
        <DotGrid
          color="#fff"
          :density="160"
          :dot-size="0.21"
          :opacity="0.3"
          :twinkle="1"
          mask-type="alphaInverted"
          mask-source="idmh3ecgzg538kzalmj"
        />
        <Blob
          id="idmh3ecgzg538kzalmj"
          :seed="0"
          :size
          :speed="0.5"
          :center="{ x: 0.5, y: 0.5 }"
          color-a="#ff6b35"
          color-b="#e91e63"
          :opacity="0"
          :visible="false"
          mask-type="alpha"
          :softness="0.63"
          :highlight-x="1"
          :highlight-y="1"
          :highlight-z="1"
          :deformation="0.60"
          highlight-color="#ffe11a"
          :highlight-intensity="0"
        />
      </Shader>
    </motion.div>
  </AnimatePresence>
</template>
