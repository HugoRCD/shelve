<script setup lang="ts">
const { version } = useRuntimeConfig().public
</script>

<template>
  <div class="flex items-center gap-2">
    <Logo lp />
    <span v-if="version" class="text-xs font-mono text-muted">| v{{ version }}</span>
  </div>
</template>
