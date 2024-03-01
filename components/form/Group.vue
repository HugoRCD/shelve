<script setup lang="ts">
import type { PropType } from "vue";
import CInput from "~/components/CInput.vue";

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
    type: String as PropType<"text" | "email" | "password">,
    default: "text",
  },
  placeholder: {
    type: String,
    required: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
})

const model = defineModel({ type: String, required: true })
</script>

<template>
  <div>
    <label :for="label" class="block text-sm font-medium leading-6 text-primary">
      {{ label }}
      <span v-if="required" class="text-accent">*</span>
    </label>
    <div class="mt-2">
      <CInput
        v-model="model"
        :name="label"
        :type
        :placeholder
        :disabled
        required
      />
    </div>
  </div>
</template>

<style scoped>

</style>
