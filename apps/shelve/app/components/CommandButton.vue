<script setup lang="ts">
import { Motion } from 'motion-v'

defineProps<{
  icon: string
  label: string
  color?: string
  loading?: boolean
  disabled?: boolean
}>()

defineEmits<(e: 'click') => void>()
</script>

<template>
  <Motion :layout="true" class="outline-none">
    <BgHighlight rounded="full" class="hover:scale-105 cursor-pointer" :class="{ 'opacity-50': disabled }">
      <UTooltip :text="label" :content="{ side: 'top' }">
        <div class="navbar">
          <div
            class="nav-item p-0.5!"
            :class="{ [`text-${color}-500`]: color }"
            @click="!disabled && !loading && $emit('click')"
          >
            <UIcon v-if="loading" name="lucide:loader" class="text-lg animate-spin" />
            <UIcon v-else :name="icon" class="text-lg" />
          </div>
        </div>
      </UTooltip>
    </BgHighlight>
  </Motion>
</template>

<style scoped>
@import "tailwindcss";

.navbar {
  @apply backdrop-blur-lg flex items-center gap-1 sm:gap-2 rounded-full p-2;
  box-shadow: 0 7px 20px 12px rgb(65 65 65 / 10%);
}

.dark .navbar {
  box-shadow: 0 7px 20px 9px rgb(0 0 0 / 18%);
}

.nav-item {
  @apply rounded-full p-2 flex items-center justify-center;
  @apply hover:bg-(--ui-bg-muted) hover:shadow-md;
}
</style>
