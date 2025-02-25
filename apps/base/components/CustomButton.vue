<script setup lang="ts">
type ButtonProps = {
  label?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  to?: string
  loading?: boolean
  onClick?: ((event: MouseEvent) => void | Promise<void>) | Array<((event: MouseEvent) => void | Promise<void>)>
}

const roundedType = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl'
}

const props = withDefaults(defineProps<ButtonProps>(), {
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
      class="text-(--ui-text-highlighted) bg-transparent hover:bg-transparent"
      :class="roundedType[props.rounded]"
    >
      <slot v-if="!!$slots.default" />
    </UButton>
  </BgHighlight>
</template>
