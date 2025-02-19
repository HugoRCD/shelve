<script setup lang="ts">
const props = defineProps<{
  name: string
  color: string
  icon: string
  showText?: boolean
  svg?: string
  png?: string
}>()

const svgLink = computed(() => props.showText ? `/logo/logo-${props.name.toLowerCase()}.svg` : `/logo/icon-${props.name.toLowerCase()}.svg`)
const pngLink = computed(() => props.showText ? `/logo/logo-${props.name.toLowerCase()}.png` : `/logo/icon-${props.name.toLowerCase()}.png`)
</script>

<template>
  <BrandCopy :content="svgLink" :assets="{ svg: svgLink, png: pngLink }" :copy-label="`Copy ${name} logo`">
    <div class="flex flex-col gap-2">
      <div
        :style="{
          color,
          backgroundColor: color === '#000000' ? '#FFFFFF' : '#0A0A0A'
        }"
        :class="[
          'flex rounded-md border border-solid border-(--ui-border)/50',
          showText ? 'items-center gap-2 text-3xl px-6 py-8' : 'items-center justify-center p-4 aspect-square'
        ]"
      >
        <UIcon :name="icon" :class="showText ? '' : 'size-24'" />
        <span v-if="showText" class="font-bold">Shelve</span>
      </div>
    </div>
  </BrandCopy>
</template>
