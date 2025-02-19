<script setup lang="ts">
const { data: page } = await useAsyncData('brand', () => {
  return queryCollection('brand').first()
})
</script>

<template>
  <UPage v-if="page" class="py-20">
    <UMain>
      <UPageSection
        :title="page.title"
        :description="page.description"
        :ui="{
          title: 'text-left main-gradient italic font-mono font-medium',
          description: 'text-left'
        }"
      />
      <USeparator />

      <!-- Values Section -->
      <UPageSection :ui="{ container: 'sm:gap-6' }">
        <BrandHeader
          title="Values"
          :description="page.values.description"
        />
        <UPageGrid class="lg:grid-cols-3">
          <UPageCard
            v-for="value in page.values.core"
            :key="value.name"
            class="overflow-hidden"
            :ui="{ container: 'noise h-full' }"
          >
            <h3 class="font-bold">
              {{ value.name }}
            </h3>
            <p class="text-(--ui-text-muted)">
              {{ value.description }}
            </p>
          </UPageCard>
        </UPageGrid>
      </UPageSection>

      <!-- Typography Section -->
      <UPageSection :ui="{ container: 'sm:gap-6' }">
        <BrandHeader
          title="Typography"
          :description="page.typography.description"
        />
        <div class="grid gap-4">
          <div class="font-geist">
            <h3 class="text-xl mb-2">
              Geist
            </h3>
            <p class="text-lg font-medium">
              Medium - Headings
            </p>
            <p class="text-base">
              Regular - Body Text
            </p>
          </div>
          <div class="font-jetbrains">
            <h3 class="text-xl mb-2">
              JetBrains Mono
            </h3>
            <p class="font-mono">
              Code and technical content
            </p>
          </div>
        </div>
      </UPageSection>

      <!-- Brand Assets Section -->
      <UPageSection :ui="{ container: 'sm:gap-6' }">
        <BrandHeader
          title="Brand Assets"
          :description="page.logo.descriptions.main"
        />
        <UPageGrid class="lg:grid-cols-2">
          <!-- Icons -->
          <div class="space-y-4">
            <h3 class="font-bold mb-2">
              Icons
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div
                v-for="icon in page.logo.icons"
                :key="icon.name"
                class="flex flex-col gap-2"
              >
                <div
                  :style="{
                    color: icon.color,
                    backgroundColor: icon.color === '#000000' ? '#FFFFFF' : '#0A0A0A',
                  }"
                  class="flex items-center justify-center rounded-md border border-solid border-(--ui-border)/50 p-4 aspect-square"
                >
                  <UIcon :name="icon.icon" class="size-24" />
                </div>
              </div>
            </div>
          </div>

          <!-- Logos -->
          <div class="space-y-4">
            <h3 class="font-bold mb-2">
              Logos
            </h3>
            <div class="grid gap-4">
              <div
                v-for="logo in page.logo.icons"
                :key="logo.name"
                class="flex flex-col gap-2"
              >
                <div
                  :style="{
                    color: logo.color,
                    backgroundColor: logo.color === '#000000' ? '#FFFFFF' : '#0A0A0A'
                  }"
                  class="flex items-center gap-3 text-3xl rounded-md border border-solid border-(--ui-border)/50 px-6 py-8"
                >
                  <UIcon :name="logo.icon" class="" />
                  <span class="font-bold">Shelve</span>
                </div>
              </div>
            </div>
          </div>
        </UPageGrid>
      </UPageSection>

      <!-- Color Palette Section -->
      <UPageSection :ui="{ container: 'sm:gap-6' }">
        <BrandHeader
          title="Color Palette"
          :description="page.colorPalette.description"
        />
        <div class="grid gap-6">
          <div>
            <h3 class="font-bold mb-4">
              Primary Colors
            </h3>
            <UPageGrid class="lg:grid-cols-2">
              <div
                v-for="color in page.colorPalette.primary"
                :key="color.name"
                class="flex flex-col gap-2"
              >
                <div
                  :style="{ backgroundColor: color.value }"
                  class="rounded-md aspect-video border border-solid border-(--ui-border)/50"
                />
                <div class="flex flex-col">
                  <span class="font-bold">{{ color.name }}</span>
                  <span class="text-sm text-(--ui-text-muted)">{{ color.value }}</span>
                  <span class="text-sm text-(--ui-text-muted)">{{ color.usage }}</span>
                </div>
              </div>
            </UPageGrid>
          </div>
          <div>
            <h3 class="font-bold mb-4">
              Secondary Colors
            </h3>
            <UPageGrid class="lg:grid-cols-2">
              <div
                v-for="color in page.colorPalette.secondary"
                :key="color.name"
                class="flex flex-col gap-2"
              >
                <div
                  :style="{ backgroundColor: color.value }"
                  class="rounded-md aspect-video border border-solid border-(--ui-border)/50"
                />
                <div class="flex flex-col">
                  <span class="font-bold">{{ color.name }}</span>
                  <span class="text-sm text-(--ui-text-muted)">{{ color.value }}</span>
                  <span class="text-sm text-(--ui-text-muted)">{{ color.usage }}</span>
                </div>
              </div>
            </UPageGrid>
          </div>
        </div>
      </UPageSection>

      <!-- Badges Section -->
      <UPageSection :ui="{ container: 'sm:gap-6' }">
        <BrandHeader
          title="Markdown Badges"
          :description="page.badge.description"
        />
        <div class="grid gap-4">
          <div
            v-for="badge in page.badge.badges"
            :key="badge.name"
            class="space-y-2"
          >
            <MDC :value="badge.markdown" />
          </div>
        </div>
      </UPageSection>
    </UMain>
  </UPage>
</template>
