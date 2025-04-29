<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps({
  error: {
    type: Object as () => NuxtError,
    required: true,
  },
})

const router = useRouter()

const handleError = () => clearError({ redirect: '/' })
const goBack = () => {
  clearError()
  router.back()
}
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center">
    <div class="relative z-20 text-center">
      <span class="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 text-[200px] font-bold text-muted/5">
        {{ error.statusCode }}
      </span>
      <div v-if="error.statusCode === 404">
        <h1 class="font-serif text-4xl font-light italic">
          Looks like you're lost
        </h1>
        <p class="text-sm text-muted">
          The page you're looking for doesn't exist
        </p>
      </div>
      <div v-else>
        <h1 class="font-serif text-4xl font-light italic">
          An error occurred
        </h1>
        <p class="text-sm text-muted">
          Refresh the page or try again later
        </p>
      </div>
      <div class="mt-8 flex justify-center space-x-4">
        <UButton variant="soft" @click="handleError">
          Go home
        </UButton>
        <UButton @click="goBack">
          Go back
        </UButton>
      </div>
    </div>
  </div>
</template>
