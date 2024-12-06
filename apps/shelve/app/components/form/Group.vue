<script setup lang="ts">
type GroupProps = {
  label?: string
  required?: boolean
  type?: 'text' | 'email' | 'password' | 'textarea'
  autofocus?: boolean
  placeholder?: string
  disabled?: boolean
  rows?: number
}

const { rows = 6, type = 'text' } = defineProps<GroupProps>()

const model = defineModel({ type: String })
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
    <UInput
      v-else
      v-model="model"
      class="w-full"
      :placeholder
      :autofocus
      :disabled
      :type
    />
  </UFormField>
</template>

