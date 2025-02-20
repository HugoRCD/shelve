<script setup lang="ts">
definePageMeta({
  title: 'Brand Guidelines',
  description: 'Welcome to Shelve\'s brand guidelines. These guidelines ensure a consistent and professional representation of Shelve across all platforms, emphasizing our commitment to simplicity, elegance, and developer experience.',
  colorMode: 'dark',
})

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

      <!-- Logo Section -->
      <UPageSection :ui="{ container: 'sm:gap-6' }">
        <BrandHeader
          title="Shelve Logo"
          :description="page.logo.descriptions.main"
        />
        <BrandHeader
          title="Icon"
          :description="page.logo.descriptions.icon"
        />
        <BrandHeader
          title="Logo"
          :description="page.logo.descriptions.logo"
        />
        <UPageGrid class="lg:grid-cols-2">
          <div class="space-y-4">
            <h3 class="font-bold mb-2">
              Icons
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <BrandLogoCard
                v-for="icon in page.logo.icons"
                :key="icon.name"
                v-bind="icon"
              />
            </div>
          </div>
          <div class="space-y-4">
            <h3 class="font-bold mb-2">
              Logos
            </h3>
            <div class="grid gap-4">
              <BrandLogoCard
                v-for="logo in page.logo.icons"
                :key="logo.name"
                v-bind="logo"
                show-text
              />
            </div>
          </div>
        </UPageGrid>
        <BrandUsageGuidelines
          :do="page.logo.usage.do"
          :dont="page.logo.usage.dont"
        />
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
              <BrandColorCard
                v-for="color in page.colorPalette.primary"
                :key="color.name"
                v-bind="color"
              />
              <BrandColorCard
                v-for="color in page.colorPalette.secondary"
                :key="color.name"
                v-bind="color"
              />
            </UPageGrid>
          </div>
        </div>
      </UPageSection>

      <!-- Typography Section -->
      <UPageSection :ui="{ container: 'sm:gap-6' }">
        <BrandHeader
          title="Typography"
          :description="page.typography.description"
        />
        <div class="grid gap-6">
          <div>
            <h3 class="font-bold mb-4">
              Geist - Primary Font
            </h3>
            <BrandTypographyShowcase font="geist" />
          </div>
          <div>
            <h3 class="font-bold mb-4">
              JetBrains Mono - Code Font
            </h3>
            <BrandTypographyShowcase font="jetbrains" />
          </div>
        </div>
      </UPageSection>

      <!-- Badges Section -->
      <UPageSection :ui="{ container: 'sm:gap-6' }">
        <BrandHeader
          title="Markdown Badges"
          :description="page.badge.description"
        />
        <div class="grid lg:grid-cols-2 gap-4">
          <BrandMarkdownBadge
            v-for="badge in page.badge.badges"
            :key="badge.name"
            v-bind="badge"
          />
        </div>
        <div class="space-y-4 p-6 text-sm rounded-md border border-(--ui-border)/50">
          <div class="text-(--ui-text-muted) font-medium">
            Usage
          </div>
          <div v-for="usage in page.badge.usage" :key="usage">
            {{ usage }}
          </div>
        </div>
        <BrandUsageGuidelines
          :do="page.badge.placement"
          :dont="[]"
        />
      </UPageSection>

      <!-- Voice & Tone Section -->
      <UPageSection :ui="{ container: 'sm:gap-6' }">
        <BrandHeader
          title="Voice & Tone"
          :description="page.voice.description"
        />
        <BrandVoice
          :tone="page.voice.tone"
          :keywords="page.voice.keywords"
        />
      </UPageSection>

      <!-- Social Media Section -->
      <UPageSection :ui="{ container: 'sm:gap-6' }">
        <BrandHeader
          title="Social Media Presence"
          :description="page.social.description"
        />
        <BrandSocial :platforms="page.social.platforms" />
      </UPageSection>
    </UMain>
  </UPage>
</template>
