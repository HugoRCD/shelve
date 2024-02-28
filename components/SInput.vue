<script setup lang="ts">
import type { PropType } from "vue";

defineProps({
  type: {
    type: String as PropType<"text" | "email" | "password">,
    default: "text"
  },
  placeholder: {
    type: String,
    required: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    required: true
  }
});

const model = defineModel({ type: String, required: true });
</script>

<template>
  <div>
    <input
      v-model="model"
      :name="name"
      :type="type"
      :autocomplete="name"
      :disabled
      :placeholder="placeholder"
      required
      class="block w-full rounded-md border-0 px-2 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm sm:leading-6"
    >
  </div>
</template>

<style scoped>

</style>
