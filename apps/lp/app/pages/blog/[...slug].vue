<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { findPageBreadcrumb, mapContentNavigation } from '#ui-pro/utils/content'

const route = useRoute()

const { data: page } = await useAsyncData(route.path, () =>
  queryCollection('blog').path(route.path).first()
)
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: `Page not found: ${route.path}`, fatal: true })
}

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
const blogNavigation = computed(() => navigation.value.find(item => item.path === '/blog')?.children || [])

const breadcrumb = computed(() => mapContentNavigation(findPageBreadcrumb(blogNavigation?.value, page.value)).map(({ icon, ...link }) => link))

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
</script>

<template>
  <UMain class="mt-20 px-2">
    <ShelveMeta :default-og-image="false" :title="page?.title" :description="page?.description" />
    <UContainer class="relative min-h-screen bg-(--ui-bg-muted) px-4 sm:px-6 pt-6 border-x border-t border-(--ui-border) rounded-t-sm shadow-sm">
      <UPage v-if="page">
        <ULink to="/blog" class="font-mono text-sm flex items-center gap-1">
          <UIcon name="lucide:chevron-left" />
          Blog
        </ULink>
        <div class="flex flex-col gap-2 mt-8">
          <h1 class="text-4xl font-bold">
            {{ page.title }}
          </h1>
          <p class="text-(--ui-text-muted)">
            {{ page.description }}
          </p>
          <div class="flex items-center gap-2 mt-2">
            <UUser
              v-for="(author, index) in page.authors"
              :key="index"
              color="neutral"
              variant="outline"
              v-bind="author"
            />
          </div>
        </div>
        <USeparator class="mt-4 mb-6" />
        <UPageBody class="leading-relaxed">
          <ContentRenderer v-if="page.body" :value="page" />

          <USeparator class="mb-4" />
          <div class="flex justify-end">
            <ULink :to="editThisPage.to" class="text-xs flex items-center gap-1">
              <UIcon name="i-heroicons-pencil-square-solid" />
              Edit this page
            </ULink>
          </div>
        </UPageBody>
      </UPage>
    </UContainer>
  </UMain>
</template>
