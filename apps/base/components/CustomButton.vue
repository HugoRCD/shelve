<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'

const roundedType = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl'
}

type CustomButtonProps = ButtonProps & {
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<CustomButtonProps>(), {
  rounded: 'md',
})
</script>

<template>
  <BgHighlight
    :rounded="props.rounded"
    class="active:translate-y-[1px] hover:opacity-90 shadow-lg dark:shadow-none"
  >
    <UButton
      v-bind="props"
      class="text-highlighted bg-transparent hover:bg-transparent disabled:bg-transparent"
      :class="roundedType[props.rounded]"
    >
      <slot v-if="!!$slots.default" />
    </UButton>
  </BgHighlight>
</template>
