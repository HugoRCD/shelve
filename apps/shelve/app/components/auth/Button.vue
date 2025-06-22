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
})

function open() {
  loading.value = true
  window.location.href = `/auth/${props.provider}`
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
