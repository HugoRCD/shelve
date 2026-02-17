<script setup lang="ts">
import { getAuthErrorMessage } from '~/utils/auth-error'

const loading = ref(false)
const { signIn } = useUserSession()
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

function open() {
  loading.value = true
  signIn.social({
    provider: props.provider,
    callbackURL: props.redirectUrl || undefined,
  })
    .catch((error: unknown) => {
      toast.error(getAuthErrorMessage(error, `Failed to sign in with ${props.provider}`))
      loading.value = false
    })
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
