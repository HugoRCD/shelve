<script setup lang="ts">
const roundedType = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full'
}

const props = withDefaults(defineProps<{
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
}>(), {
  rounded: 'md'
})
</script>

<template>
  <div class="highlight-wrapper highlight-gradient" :class="roundedType[props.rounded]">
    <div class="bg-elevated" :class="roundedType[props.rounded]">
      <slot />
    </div>
  </div>
</template>
