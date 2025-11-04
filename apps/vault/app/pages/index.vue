<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v'
import Encrypt from '~/components/Encrypt.vue'
import Decrypt from '~/components/Decrypt.vue'

const route = useRoute()

const isDecrypt = computed(() => !!route.query.id || route.query.decrypt === 'true')
</script>

<template>
  <div class="w-full min-h-[400px]">
    <AnimatePresence mode="wait">
      <motion.div
        :key="isDecrypt ? 'decrypt' : 'encrypt'"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :exit="{ opacity: 0, y: -20 }"
        :transition="{ duration: 0.3, ease: 'easeOut' }"
        class="w-full"
      >
        <Encrypt v-if="!isDecrypt" />
        <Decrypt v-else />
      </motion.div>
    </AnimatePresence>
  </div>
</template>
