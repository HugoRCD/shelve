<script lang="ts" setup>
const navigation = getNavigation("app");
</script>

<template>
  <div>
    <nav class="flex items-center justify-between p-5">
      <NuxtLink to="/" class="font-newsreader text-2xl font-light italic">
        Shelve
      </NuxtLink>
      <div class="flex gap-3">
        <NuxtLink
          v-for="item in navigation"
          :key="item.name"
          :to="item.to"
        >
          {{ item.name }}
        </NuxtLink>
      </div>
      <DropdownMenu />
    </nav>
    <slot />
  </div>
</template>

<style scoped>

</style>
