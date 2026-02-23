<script setup lang="ts">
import type { NuxtError } from '#app'

type ErrorProps = {
  error: NuxtError
}

const { error } = defineProps<ErrorProps>()
console.error(error)

const router = useRouter()
const { signOut } = useUserSession()

const handleError = () => clearError({ redirect: '/' })
const goBack = () => {
  clearError()
  router.back()
}

const clearCache = async () => {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(name => caches.delete(name)))
      window.location.reload()
    } catch (err) {
      console.error('Error clearing cache:', err)
    }
  }
}

const clearCookies = async () => {
  document.cookie.split(';').forEach(cookie => {
    const [name] = cookie.split('=')
    document.cookie = `${name?.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
  })
  await signOut()
  navigateTo('/login')
}

const clearLocalStorage = () => {
  localStorage.clear()
  window.location.reload()
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

      <div class="mt-4">
        <UDrawer
          title="Error Details"
          description="View the error details"
          direction="right"
          nested
        >
          <UButton
            label="Show Error"
            variant="soft"
            trailing-icon="lucide:chevron-right"
          />
          <template #body>
            <pre class="text-left whitespace-pre-wrap">{{ error }}</pre>
          </template>
        </UDrawer>
      </div>
    </div>
    <div class="absolute bottom-5 right-5 z-10 flex gap-2">
      <UButton
        variant="soft"
        size="sm"
        @click="clearCache"
      >
        Clear Cache
      </UButton>
      <UButton
        variant="soft"
        size="sm"
        @click="clearCookies"
      >
        Clear Cookies
      </UButton>
      <UButton
        variant="soft"
        size="sm"
        @click="clearLocalStorage"
      >
        Clear LocalStorage
      </UButton>
    </div>
  </div>
</template>
