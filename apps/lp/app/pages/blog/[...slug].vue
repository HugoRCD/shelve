<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { findPageBreadcrumb, mapContentNavigation } from '#ui-pro/utils/content'

definePageMeta({
  layout: 'default'
})

const route = useRoute()

const { data: page } = await useAsyncData(route.path, () =>
  queryCollection('blog').path(route.path).first()
)
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: `Page not found: ${route.path}`, fatal: true })
}

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const breadcrumb = computed(() => mapContentNavigation(findPageBreadcrumb(navigation?.value, page.value)).map(({ icon, ...link }) => link))

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
    <UContainer class="min-h-screen bg-neutral-50 dark:bg-neutral-900 px-4 sm:px-8 pt-2 border-x border-t border-neutral-200 dark:border-neutral-800 rounded-t-sm shadow-sm">
      <UPage v-if="page">
        <UPageHeader :title="page.title">
          <template #headline>
            <UButton label="Blog" icon="lucide:chevron-left" variant="ghost" size="xs" to="/blog" />
            <UColorModeButton />
          </template>

          <template #description>
            <p class="text-neutral-500">
              {{ page.description }}
            </p>
          </template>

          <template v-if="page.authors?.length" #links>
            <UUser
              v-for="(author, index) in page.authors"
              :key="index"
              color="neutral"
              variant="outline"
              v-bind="author"
            />
          </template>
        </UPageHeader>

        <UPageBody>
          <ContentRenderer v-if="page.body" :value="page" />

          <USeparator class="mb-4" />
          <ULink :to="editThisPage.to" class="text-sm flex items-center gap-1">
            <UIcon name="i-heroicons-pencil-square-solid" />
            Edit this page
          </ULink>
        </UPageBody>

        <template v-if="page?.body?.toc?.links?.length" #right>
          <UContentToc highlight :links="page.body.toc.links" class="z-[2] bg-white dark:bg-neutral-950">
            <template #default>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-align-left" />
                On this page
              </div>
            </template>
          </UContentToc>
        </template>
      </UPage>
    </UContainer>
  </UMain>
</template>
