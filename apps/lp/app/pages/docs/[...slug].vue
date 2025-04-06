<script setup lang="ts">
import { kebabCase } from 'scule'
import type { ContentNavigationItem } from '@nuxt/content'
import { findPageBreadcrumb, mapContentNavigation } from '#ui-pro/utils'

definePageMeta({
  layout: false,
  key: 'docs'
})

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation', ref([]))
const docsNavigation = computed(() => navigation.value.find(item => item.path === '/docs')?.children || [])

const route = useRoute()
const nuxtApp = useNuxtApp()

const path = computed(() => route.path.replace(/\/$/, ''))

function paintResponse() {
  if (import.meta.server) {
    return Promise.resolve()
  }
  return new Promise((resolve) => {
    setTimeout(resolve, 100)
    requestAnimationFrame(() => setTimeout(resolve, 0))
  })
}

const [{ data: page, status }, { data: surround }] = await Promise.all([
  useAsyncData(kebabCase(path.value), () => paintResponse().then(() => nuxtApp.static[kebabCase(path.value)] ?? queryCollection('docs').path(path.value).first()), {
    watch: [path]
  }),
  useAsyncData(`${kebabCase(path.value)}-surround`, () => paintResponse().then(() => nuxtApp.static[`${kebabCase(path.value)}-surround`] ?? queryCollectionItemSurroundings('docs', path.value, {
    fields: ['description']
  })), { watch: [path] })
])

watch(status, (status) => {
  if (status === 'pending') {
    nuxtApp.hooks.callHook('page:loading:start')
  } else if (status === 'success' || status === 'error') {
    nuxtApp.hooks.callHook('page:loading:end')
  }
})

watch(page, (page) => {
  if (!page) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
  }
}, { immediate: true })

const breadcrumb = computed(() => {
  return mapContentNavigation(findPageBreadcrumb(navigation.value, page.value)).map(link => ({
    label: link.label,
    to: link.to
  }))
})

defineOgImageComponent('Docs', {
  headline: breadcrumb.value.map(item => item.label).join(' > ')
}, {
  fonts: ['Geist:400', 'Geist:600'],
})

const editThisPage = computed(() => ({
  icon: 'i-heroicons-pencil-square-solid',
  label: 'Edit this page',
  to: `https://github.com/hugorcd/shelve/edit/main/apps/lp/content/${page?.value?.stem}.md`,
  target: '_blank'
}))

const communityLinks = computed(() => [
  {
    icon: 'lucide:bot',
    label: 'llms.txt',
    to: 'https://shelve.cloud/llms.txt',
  },
  {
    icon: 'i-heroicons-star-solid',
    label: 'Star on GitHub',
    to: `https://github.com/hugorcd/shelve`,
    target: '_blank'
  },
  {
    icon: 'i-heroicons-lifebuoy-solid',
    label: 'Contributing',
    to: '/docs/contributing'
  }
])
</script>

<template>
  <Header :links="[]" />
  <UMain>
    <ShelveMeta :default-og-image="false" :title="page?.title" :description="page?.description" />
    <UContainer v-if="page">
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
        <UPage>
          <UPageHeader v-bind="page" :links="page.links?.map((link: any) => ({ ...link, size: 'md' }))">
            <template #headline>
              <UBreadcrumb :items="breadcrumb" />
            </template>
          </UPageHeader>

          <UPageBody>
            <ContentRenderer v-if="page.body" :value="page" />
            <div>
              <USeparator class="my-10">
                <div class="flex items-center gap-2 text-sm dark:text-gray-400">
                  <UButton size="sm" variant="link" color="neutral" to="https://github.com/nuxt/nuxt/issues/new/choose" target="_blank">
                    Report an issue
                  </UButton>
                  or
                  <UButton size="sm" variant="link" color="neutral" :to="editThisPage.to" target="_blank">
                    Edit this page on GitHub
                  </UButton>
                </div>
              </USeparator>
              <UContentSurround :surround />
            </div>
          </UPageBody>

          <template v-if="page?.body?.toc?.links?.length" #right>
            <UContentToc :links="page.body?.toc?.links" highlight class="lg:backdrop-blur-none">
              <template #bottom>
                <div class="hidden lg:block space-y-6" :class="{ '!mt-6': page.body?.toc?.links?.length }">
                  <USeparator v-if="page.body?.toc?.links?.length" type="dashed" />
                  <UPageLinks title="Community" :links="communityLinks" />
                </div>
              </template>
            </UContentToc>
          </template>
        </UPage>
      </UPage>
    </UContainer>
  </UMain>
</template>
