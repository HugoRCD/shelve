<script setup lang="ts">
type LogoProps = {
  size?: string
  text?: boolean
}

const { size = 'size-5', text = true } = defineProps<LogoProps>()
</script>

<template>
  <div class="flex items-center gap-2">
    <UIcon name="custom:shelve" :size />
    <NuxtLink v-if="text" to="/" class="font-semibold" aria-label="Shelve">
      Shelve
    </NuxtLink>
  </div>
</template>

<style scoped>

</style>
