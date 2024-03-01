<script setup lang="ts">
defineProps({
  text: {
    type: String
  }
});
</script>

<template>
  <div class="linebreak">
    <div class="absolute flex w-full -translate-y-1/2 items-center justify-center text-gray-400">
      <span class="bg-primary px-2">
        {{ text }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.linebreak {
  position: relative;
  left: 0;
  top: 0;
  right: 0;
  bottom: auto;
  width: 100%;
  height: 1px;
  margin: 0 auto;
  background-image: linear-gradient(95deg, rgba(215, 196, 255, 0) 0%, rgba(200, 200, 200, 0.24) 50%, rgba(215, 196, 255, 0) 100%);
}
</style>
