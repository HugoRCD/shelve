<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import type { NavigationMenuItem } from '@nuxt/ui'

const { links = [] } = defineProps<{
  links?: NavigationMenuItem[]
}>()

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation', ref([]))
const docsNavigation = computed(() => navigation.value.find(item => item.path === '/docs')?.children || [])

const { version } = useRuntimeConfig().public

defineShortcuts({
  meta_g: () => {
    window.open('https://github.com/hugorcd/shelve', '_blank')
  }
})
</script>

<template>
  <UHeader :ui="{ left: 'min-w-0' }" mode="drawer" :menu="{ shouldScaleBackground: true }">
    <template #left>
      <Logo lp /> <span class="text-xs font-mono text-(--ui-text-muted)">| v{{ version }}</span>
    </template>

    <UContentSearchButton :collapsed="false" class="w-[300px]" />

    <template #right>
      <CustomButton label="Get Started" size="xs" to="https://app.shelve.cloud" />

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

    <template #body>
      <UNavigationMenu orientation="vertical" :items="links" class="-mx-2.5" />

      <USeparator type="dashed" class="mt-4 mb-6" />

      <UContentNavigation :navigation="docsNavigation" highlight />
    </template>
  </UHeader>
</template>
