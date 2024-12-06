<script setup lang="ts">
defineProps({
  active: {
    type: Boolean,
    required: true,
  },
  activeText: {
    type: String,
    required: true,
  },
  inactiveText: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div>
    <UTooltip v-if="active" :text="activeText" :content="{ side: 'top' }">
      <span class="relative flex size-3">
        <span class="absolute inline-flex size-full animate-ping rounded-full bg-green-500/80 opacity-75" />
        <span class="relative inline-flex size-3 scale-90 rounded-full bg-green-500" />
      </span>
    </UTooltip>
    <UTooltip v-else :text="inactiveText" :content="{ side: 'top' }">
      <span class="relative flex size-3">
        <span class="absolute inline-flex size-full rounded-full bg-neutral-500/80 opacity-75" />
        <span class="relative inline-flex size-3 scale-90 rounded-full bg-neutral-500" />
      </span>
    </UTooltip>
  </div>
</template>

