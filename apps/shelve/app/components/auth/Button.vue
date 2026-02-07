<script setup lang="ts">
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
    .catch(() => {
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
