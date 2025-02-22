<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
const docsNavigation = computed(() => navigation.value.find(item => item.path === '/docs')?.children || [])

const links = computed(() => [
  /*{
    label: 'Docs',
    icon: 'i-lucide-square-play',
    to: '/getting-started',
    active: route.path.startsWith('/getting-started')
  }*/
])
</script>

<template>
  <div>
    <Header :links />
    <UMain>
      <UContainer>
        <UPage>
          <template #left>
            <UPageAside>
              <UContentNavigation :navigation="docsNavigation" highlight />
            </UPageAside>
          </template>
          <slot />
        </UPage>
      </UContainer>
    </UMain>
  </div>
</template>
