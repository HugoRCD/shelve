<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

defineProps<{
  encryptedText: boolean
}>()

const encryptionElement = ref<HTMLElement | null>(null)

const updateMousePosition = (e: MouseEvent) => {
  if (!encryptionElement.value) return

  const rect = encryptionElement.value.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * 100
  const y = ((e.clientY - rect.top) / rect.height) * 100

  encryptionElement.value.style.setProperty('--x', `${x}%`)
  encryptionElement.value.style.setProperty('--y', `${y}%`)
}

onMounted(() => {
  window.addEventListener('mousemove', updateMousePosition)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', updateMousePosition)
})
</script>

<template>
  <CrossedDiv class="h-40">
    <div v-if="encryptedText" ref="encryptionElement" class="encryption absolute left-0 top-0 size-full overflow-hidden break-words font-mono text-xs leading-5 text-muted">
      GIHXTrTBRIPocF8gMJPAM5dyuwCO7DIqMlrx45EFKa8Ky06RHwDafK1CpxdOLAI6mM8YX4iHsZ188j00gNkbgDYEtrq1S5vaOIxHhALKib3EKVD5tuYf3Ej2QA0R363viNI0tP8RVD4GlLzNPHpBkePL76KLzZrXa6x88wsJN8sslwiKTxEeepv1760YPcdyrfnqv4W4RRv2Fw9f6rBIgzOaBF5Jet4rjo2eIuKCUDkM9t8ZnfvGCzguyoFkTlmLtQuzQKPZLVuPtpbbBOdrUG795uSVFCnFjnJKgHGAiAeGZmu0n1lnfNgOB9t7cLc7Gk7jUfW3aHK3es56mORlQyACrHBDVQjPiBaIbfBBAreNiZAo8NzadXQ28HOHTvdL90GYoqJC9fqitNn0R1CWVJyEqCCKlTZSU2UFhgUNCI7Zzozl7QlZceSE5SrXNjtBnAi0sMiIeJb43o2x2vHQehvUmTaejG3UqETeRxzvg4qhD1qFDkk8y3mwuq31NWDlaszIhhVNnu6NTapPGT9XKXDCMee8QOGnQuBsPEQHCNs3eX3jsZLitOCTTVljHuY8A3AEAiWudJduue5X5PTFSc1UfFt8U1Yhj4qiVQaip3XkfesyBnk7wVaAWUKrKMToGVSyeoD23U1CNibAimwV7TKRpWWGSvXdFclFM6XuigtHlZzSLOE40wY3eEw4rAPeZF30jJMZytpXVc9AsprMpCfoKMbKSPUnDuXCq1nhggY2MTkCdcGkABxsbolIuyYUZMu2Lqt18aNIN1ZudI08ZVJHCX8q2XcPv43nDtjeHE8djSxcxoXb2b0vw4Wc4AuO2Uph0K6fYSXt54nRHit19TkgCi8dhY2PZAfyiULAvmQy6CQYc5Xw8yfSVMtHnNs2kuC1e376penaAMQ1jUozKWJneHjF21aleJWjN2NJ8bMNyfTNIL1ijpGwz6urHGrSyYR94ghvxNxBwZgRJZbx5IVqjwqDxnzAacMBvViVG4UHluE4UaoLPCHkHBrYj6m32mAIjkso2tC3kBu5XmGnAVdz8UzkPzxgtORxHPEisInmi7fgLGywdQ8Zz3Zdh9912kMR9b6MQ3xRFrlZo5gOQYhSSgyH1gIyGAjjcO3O3EptA7CcRsIeaNR5O3NG4iABwLfN1ebEBC6fLMzIDLlSYs8zQwHYsdSZMbb5yoYxvfB7G4rmEQA9FJ2o1kLzk1OTAk4vUKIEt8gfSDxzgROhMjqDoIeLiWgbXLefVRNVDf0mldlPY7oinEnos1JuxfpukoDhQL5aP2e8pqvhnctNHEGyNDtL3nea1JtDOlBic0OriZlTvIRCADyDFWE7otCHnFipuCFMViCR30HM0pzuCAeQdtvChyIe3mXBxIQnbAqgbLQXhhOD79Nyf8wlyT3fWvufGlgJO4jKD0iwerKMeXGQ0lIClU2fsEGfYAno4b2xeDD1mUO78hXABPREdtj38GoIZCNpxN69TLnCqLDG0pIkXxyYDaMmU9C5YnUr81n1xOgVyeH4iJvMF7CQkuYgWAsvwSwcNtIDtU2vjzXORp4VDlRjXDu4SqGbCDvijjn4wCJLJE1mLvv9R5mMOjHDBVdEOjoJuMp7YpVqSIWenC3oLGsJPJl5KarsVxaMnSWTHRw8wDVHNOcXXO9ZGGQGdi31ikeIfZABoUBKmeyBbgepVlCkDy3aytzYiwmX7fosxj1vk6qbji9GbVNEhimXHZR2rFuKBpov1nahPbopBpfaGKY15UoN2pQOtV5oG1MngCxTTqNBu8khxbYDbRDilYYwbiWk
    </div>
    <div class="relative z-10 ml-4 flex h-full flex-col justify-center">
      <slot />
    </div>
  </CrossedDiv>
</template>

<style scoped>
.encryption {
  --x: 80%;
  --y: 0%;
  transition: .2s ease-out;
  -webkit-mask-image: radial-gradient(300px circle at var(--x) var(--y), #000 10%, rgba(0, 0, 0, .25), transparent);
  mask-image: radial-gradient(300px circle at var(--x) var(--y), #000 10%, rgba(0, 0, 0, .25), transparent);
  opacity: .4;
}
</style>
