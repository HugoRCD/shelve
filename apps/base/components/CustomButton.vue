<script setup lang="ts">
type ButtonProps = {
  label?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
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
  rounded: 'md'
})
</script>

<template>
  <UButton
    v-bind="props"
    class="button highlight-wrapper highlight-gradient active:translate-y-[1px] hover:opacity-90"
    :class="roundedType[props.rounded]"
  >
    <div
      class="px-2 flex truncate items-center gap-2 py-1 rounded-lg bg-gradient-to-br dark:from-zinc-700 dark:to-zinc-800 from-zinc-100 to-zinc-200 dark:text-white text-zinc-800"
      :class="roundedType[props.rounded]"
    >
      <slot v-if="!!$slots.default" />
      <span v-else>
        {{ label }}
      </span>
    </div>
  </UButton>
</template>
