<script setup lang="ts">
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
  redirectUrl: {
    type: String,
    default: '',
  },
})

function open() {
  loading.value = true
  const url = props.redirectUrl
    ? `/auth/${props.provider}?redirect=${encodeURIComponent(props.redirectUrl)}`
    : `/auth/${props.provider}`
  window.location.href = url
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
