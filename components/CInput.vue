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
});

const model = defineModel({ type: String, required: true });

/*background: rgba(255, 255, 255, 0.06);
border: 0.5px solid rgba(255, 255, 255, 0.08);
box-shadow: rgba(0, 0, 0, 0.08) 1px 1px 1px inset;
backdrop-filter: blur(2px);
*/
</script>

<template>
  <div>
    <!--    <input
      v-model="model"
      :name="name"
      :type="type"
      :autocomplete="name"
      :disabled
      :placeholder="placeholder"
      required
      class="block w-full rounded-md border-0 bg-primary px-2 py-1.5 shadow-sm outline-none ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
    >-->
    <input
      v-model="model"
      :type="type"
      :autocomplete="type"
      :disabled
      :placeholder="placeholder"
      required
      class="w-full rounded-md border-black/10 bg-black/5 px-3 py-1.5 text-sm outline-none ring-1 ring-inset ring-black/10 backdrop-blur-3xl placeholder:text-black/40 dark:border-white/10 dark:bg-white/5 dark:ring-white/10 dark:placeholder:text-white/40"
    >
  </div>
</template>

<style scoped>

</style>
