<script setup lang="ts">
const route = useRoute()
const loading = ref(false)

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  provider: {
    type: String,
    required: true,
  },
})

async function open() {
  loading.value = true
  
  try {
    const redirectParam = route.query.redirect as string | undefined
    
    const { oauthUrl } = await $fetch('/api/auth/prepare-oauth', {
      method: 'POST',
      body: {
        provider: props.provider,
        redirectUrl: redirectParam
      }
    })
    
    window.location.href = oauthUrl
  } catch (error) {
    console.error('OAuth preparation failed:', error)
    loading.value = false
    window.location.href = `/auth/${props.provider}`
  }
}
</script>

<template>
  <UButton
    :loading
    :disabled="loading"
    external
    :icon
    block
    class="rounded-none"
    :label
    @click="open"
  />
</template>
