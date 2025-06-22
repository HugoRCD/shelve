<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation', ref([]))
const docsNavigation = computed(() => navigation.value.find(item => item.path === '/docs')?.children || [])
</script>

<template>
  <div>
    <Header />
    <UMain>
      <UContainer>
        <UPage>
          <template #left>
            <UPageAside>
              <UContentNavigation
                :navigation="docsNavigation"
                trailing-icon="i-lucide-chevron-right"
                :ui="{ linkTrailingIcon: 'group-data-[state=open]:rotate-90' }"
                highlight
              />
            </UPageAside>
          </template>
          <slot />
        </UPage>
      </UContainer>
    </UMain>
    <LayoutFooter />
  </div>
</template>
