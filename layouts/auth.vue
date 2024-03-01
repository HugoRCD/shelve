<template>
  <div class="relative flex h-full flex-col bg-primary">
    <Noise />
    <div class="z-20 flex-1">
      <slot />
    </div>
    <LayoutAuthFooter />
  </div>
</template>

<script setup lang="ts">
</script>
