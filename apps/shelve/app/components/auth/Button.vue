<script setup lang="ts">
const signInSocial = useSignIn('social')
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
  redirectUrl: {
    type: String,
    required: false,
    default: undefined,
  },
})

const loading = computed(() => signInSocial.status.value === 'pending')

async function open() {
  await signInSocial.execute({
    provider: props.provider,
    callbackURL: props.redirectUrl || undefined,
  })

  if (signInSocial.status.value === 'error') {
    toast.error(getAuthErrorMessage(signInSocial.error.value, `Failed to sign in with ${props.provider}`))
  }
}
</script>

<template>
  <UButton
    :loading
    :disabled="loading"
    :icon
    block
    class="rounded-none"
    :label
    @click="open"
  />
</template>
