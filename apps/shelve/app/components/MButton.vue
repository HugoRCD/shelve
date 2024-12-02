<script setup lang="ts">
type ButtonProps = {
  label: string
  icon?: string
  loading?: boolean
}

defineProps<ButtonProps>()
</script>

<template>
  <button class="cursor-pointer custom-button px-3 py-1 rounded-md">
    <UIcon v-if="icon" :name="loading ? 'loading' : icon" class="size-4" />
    {{ label }}
  </button>
</template>

<style scoped>
.custom-button {
  background: hsl(20, 7%, 20%);
  box-shadow: 0 1px 2px #0c090852, 0 3px 3px #0c09081a, 0 1px #d6cfc21f inset;
  color: #fbfaf9;
}
.custom-button:hover {
  background: hsl(20, 7%, 30%);
}

.dark {
  .custom-button {
    background: hsl(60, 2%, 98%);
    box-shadow: 0 1px 2px #00000015, 0 3px 3px #0000000d, 0 1px #ffffff80 inset;
    color: #1a1a1a;
  }
}
</style>
