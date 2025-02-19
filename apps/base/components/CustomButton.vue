<script setup lang="ts">
type ButtonProps = {
  label?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  onClick?: ((event: MouseEvent) => void | Promise<void>) | Array<((event: MouseEvent) => void | Promise<void>)>
}

const props = defineProps<ButtonProps>()
</script>

<template>
  <UButton
    v-bind="props"
    class="h-fit active:translate-y-[1px] w-fit rounded-lg bg-gradient-to-br dark:from-zinc-200 dark:from-[3%] dark:via-zinc-600 dark:via-30% dark:to-zinc-900 from-zinc-200 from-[3%] via-zinc-300 via-30% to-zinc-500 p-[1px] transition-all duration-200 hover:opacity-90"
  >
    <div class="px-2 flex truncate items-center gap-2 py-1 rounded-lg bg-gradient-to-br dark:from-zinc-700 dark:to-zinc-800 from-zinc-100 to-zinc-200 dark:text-white text-zinc-800">
      <slot v-if="!!$slots.default" />
      <span v-else>
        {{ label }}
      </span>
    </div>
  </UButton>
</template>
