<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

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
              <UContentNavigation :navigation highlight :ui="{ linkTrailingBadge: 'font-semibold uppercase' }">
                <template #link-title="{ link }">
                  <span class="inline-flex items-center gap-0.5">
                    {{ link.title }}
                  </span>
                </template>
              </UContentNavigation>
            </UPageAside>
          </template>
          <slot />
        </UPage>
      </UContainer>
    </UMain>
  </div>
</template>
