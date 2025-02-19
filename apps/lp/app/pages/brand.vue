<script setup lang="ts">
const { data: page } = await useAsyncData('brand', () => {
  return queryCollection('brand').first()
})
</script>

<template>
  <UPage v-if="page" class="py-20">
    <UMain>
      <UPageSection :title="page.title" :description="page.description" :ui="{ title: 'text-left', description: 'text-left' }" />
      <USeparator />
      <UPageSection :ui="{ container: 'sm:gap-4' }">
        <div class="flex flex-col gap-2">
          <span class="text-lg font-bold">
            Shelve Logo
          </span>
          <span class="text-(--ui-text-muted)">
            {{ page.logo.description }}
          </span>
        </div>
        <UPageGrid class="lg:grid-cols-2">
          <div
            v-for="icon in page.logo.icons"
            :key="icon.name"
            :style="{ color: icon.color, backgroundColor: icon.color === '#000000' ? '#FFFFFF' : '#000000' }"
            class="flex items-center justify-center rounded-lg border border-solid border-(--ui-border)/50 p-2 h-36"
          >
            <UIcon :name="icon.icon" class="size-16" />
          </div>
        </UPageGrid>
      </UPageSection>

      <UPageSection :ui="{ container: 'sm:gap-4' }">
        <div class="flex flex-col gap-2">
          <span class="text-lg font-bold">
            Logo
          </span>
          <span class="text-(--ui-text-muted)">
            {{ page.logo.description }}
          </span>
        </div>
        <UPageGrid class="lg:grid-cols-2">
          <div
            v-for="logo in page.logo.logos"
            :key="logo.name"
            :style="{ color: logo.color, backgroundColor: logo.color === '#000000' ? '#FFFFFF' : '#000000' }"
            class="flex gap-2 items-center  text-3xl justify-center rounded-lg border border-solid border-(--ui-border)/50 p-2 h-36"
          >
            <UIcon :name="logo.icon" />
            <span class="font-bold">
              Shelve
            </span>
          </div>
        </UPageGrid>
      </UPageSection>

      <UPageSection :ui="{ container: 'sm:gap-4' }">
        <div class="flex flex-col gap-2">
          <span class="text-lg font-bold">
            Color Palette
          </span>
          <span class="text-(--ui-text-muted)">
            {{ page.colorPalette.description }}
          </span>
        </div>
        <UPageGrid class="lg:grid-cols-2">
          <div
            v-for="color in page.colorPalette.colors"
            :key="color.name"
            :style="{ color: color.value, backgroundColor: color.value }"
            class="flex items-center justify-center rounded-lg border border-solid border-(--ui-border)/50 p-2 h-36"
          >
            <span class="text-sm font-bold">
              {{ color.name }}
            </span>
          </div>
        </UPageGrid>
      </UPageSection>
    </UMain>
  </UPage>
</template>

<style scoped>

</style>
