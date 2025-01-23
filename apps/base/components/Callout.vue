<script setup lang="ts">
type CalloutProps = {
  class?: string
}

const props = defineProps<CalloutProps>()
</script>

<template>
  <div class="bg-stripes" :class="props.class ? props.class : 'p-4 sm:p-7'">
    <CrossedDiv class="p-4 size-full bg-[var(--ui-bg)]">
      <slot />
    </CrossedDiv>
  </div>
</template>

