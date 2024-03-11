<template>
  <div class="relative flex h-full flex-col">
    <Noise />
    <div class="z-20 flex-1">
      <slot />
    </div>
    <LayoutAuthFooter />
  </div>
</template>

<script setup lang="ts">
</script>
