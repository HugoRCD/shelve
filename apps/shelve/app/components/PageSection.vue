<script setup lang="ts">
import type { DropdownItem } from '@nuxt/ui'

type SectionProps = {
  title: string
  description?: string
  image?: string
  actions?: DropdownItem[][]
}

defineProps<SectionProps>()
</script>

<template>
  <Motion
    :initial="{ opacity: 0, transform: 'translateY(10px)' }"
    :animate="{ opacity: 1, transform: 'translateY(0)' }"
    :transition="{ delay: 0.2 }"
    class="flex flex-col gap-4"
  >
    <div class="flex items-start justify-between gap-4">
      <div class="flex items-center gap-4 mb-2">
        <NuxtImg v-if="image" :src="image" class="size-10 rounded-full" format="webp" />
        <div>
          <h2 class="text-lg font-bold">
            {{ title }}
          </h2>
          <p class="text-sm text-muted">
            {{ description }}
          </p>
        </div>
      </div>
      <slot name="trailing">
        <UDropdownMenu
          v-if="actions && actions.length > 0"
          :items="actions"
          :content="{
            align: 'start',
            side: 'right',
            sideOffset: 8
          }"
        >
          <UButton variant="ghost" icon="heroicons:ellipsis-horizontal-20-solid" />
        </UDropdownMenu>
      </slot>
    </div>
    <Motion
      :initial="{ opacity: 0, transform: 'translateY(10px)' }"
      :animate="{ opacity: 1, transform: 'translateY(0)' }"
      :transition="{ delay: 0.3 }"
    >
      <slot />
    </Motion>

    <Teleport defer to="#action-items">
      <slot name="actions" />
    </Teleport>
  </Motion>
</template>
