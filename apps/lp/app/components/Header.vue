<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import type { NavigationMenuItem } from '@nuxt/ui'

const props = defineProps<{
  links: NavigationMenuItem[]
}>()

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const items = computed(() => props.links.map(({ icon, ...link }) => link))

defineShortcuts({
  meta_g: () => {
    window.open('https://github.com/hugorcd/shelve', '_blank')
  }
})
</script>

<template>
  <UHeader class="bg-white dark:bg-neutral-950" :ui="{ left: 'min-w-0' }" mode="drawer" :menu="{ shouldScaleBackground: true }">
    <template #left>
      <NuxtLink to="/" class="flex items-end gap-2 font-bold text-[var(--ui-text-highlighted)] min-w-0 focus-visible:outline-[var(--ui-primary)] shrink-0" aria-label="Shelve">
        <div class="flex items-center gap-1">
          <UIcon name="custom:shelve" />
          <span>
            Shelve
          </span>
        </div>
      </NuxtLink>
    </template>

    <UContentSearchButton label="Search or ⌘K..." icon="lucide:search" variant="subtle" size="sm" class="w-[300px]" />

    <template #right>
      <UButton label="Get Started" size="xs" to="https://app.shelve.cloud" />

      <UContentSearchButton class="lg:hidden" />

      <UTooltip text="Open on GitHub" :kbds="['meta', 'G']" class="hidden lg:flex">
        <UButton
          color="neutral"
          variant="ghost"
          to="https://github.com/hugorcd/shelve"
          target="_blank"
          icon="simple-icons:github"
          aria-label="GitHub"
        />
      </UTooltip>

      <UColorModeButton />
    </template>

    <template #content>
      <UNavigationMenu orientation="vertical" :items="links" class="-mx-2.5" />

      <USeparator type="dashed" class="mt-4 mb-6" />

      <UContentNavigation :navigation highlight :ui="{ linkTrailingBadge: 'font-semibold uppercase' }">
        <template #link-title="{ link }">
          <span class="inline-flex items-center gap-0.5">
            {{ link.title }}
          </span>
        </template>
      </UContentNavigation>
    </template>
  </UHeader>
</template>

<style>
:root {
}
</style>
