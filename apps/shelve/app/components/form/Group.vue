<script setup lang="ts">
import type { PropType } from 'vue'

defineProps({
  label: {
    type: String,
    required: true,
  },
  required: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String as PropType<'text' | 'email' | 'password' | 'textarea'>,
    default: 'text',
  },
  autofocus: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    required: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  rows: {
    type: Number,
    default: 6
  },
})

const model = defineModel({ type: String, required: true })
</script>

<template>
  <UFormField class="w-full" :label>
    <UTextarea
      v-if="type === 'textarea'"
      v-model="model"
      autoresize
      :autofocus
      :placeholder
      :disabled
      :type
      :rows
      class="w-full"
    />
    <UInput class="w-full" v-else v-model="model" :placeholder :autofocus :disabled :type />
  </UFormField>
</template>

<style scoped>

</style>
