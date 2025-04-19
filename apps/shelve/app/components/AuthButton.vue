<script setup lang="ts">
const { signIn } = useAuth()

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

function open() {
  loading.value = true
  if (props.provider === 'google') {
    signIn.social({
      provider: 'google',
      newUserCallbackURL: '/onboarding',
    })
  }
  if (props.provider === 'github') {
    signIn.social({
      provider: 'github',
      newUserCallbackURL: '/onboarding',
    })
  }
}
</script>

<template>
  <UButton
    :loading
    :disabled="loading"
    external
    :icon
    class="rounded-none"
    @click="open"
  >
    {{ label }}
  </UButton>
</template>
