<script setup lang="ts">
import { kebabCase } from 'scule'
import type { ContentNavigationItem } from '@nuxt/content'
import { findPageBreadcrumb } from '@nuxt/content/utils'
import { mapContentNavigation } from '@nuxt/ui/utils/content'

definePageMeta({
  layout: 'docs'
})

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation', ref([]))

const route = useRoute()

const { data: page } = await useAsyncData(kebabCase(route.path), () => queryCollection('docs').path(route.path).first())
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const { data: surround } = await useAsyncData(`${kebabCase(route.path)}-surround`, () => {
  return queryCollectionItemSurroundings('docs', route.path, {
    fields: ['description']
  })
})

const breadcrumb = computed(() => mapContentNavigation(findPageBreadcrumb(navigation.value, page.value?.path)).map(link => ({
  label: link.label,
  to: link.to
})))

defineOgImageComponent('Docs', {
  headline: breadcrumb.value.map(item => item.label).join(' > ')
}, {
  fonts: ['Geist:400', 'Geist:600'],
})

const title = page.value.seo?.title || page.value.title
const description = page.value.seo?.description || page.value.description
const titleTemplate = ref('%s - Shelve Docs')

useSeoMeta({
  title,
  titleTemplate,
  description,
  ogDescription: description,
  ogTitle: titleTemplate.value?.includes('%s') ? titleTemplate.value.replace('%s', title) : title
})

defineOgImageComponent('Docs', {
  headline: breadcrumb.value.length ? breadcrumb.value.map(link => link.label).join(' > ') : '',
  title,
  description
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
  <UPage v-if="page">
    <UPageHeader
      :title="page.title"
      :description="page.description"
      :links="page.links?.map((link: any) => ({ ...link, size: 'md' }))"
    >
      <template #headline>
        <UBreadcrumb :items="breadcrumb" />
      </template>
    </UPageHeader>

    <UPageBody>
      <ContentRenderer v-if="page.body" :value="page" />
      <div>
        <Divider class="my-10">
          <div class="flex items-center gap-2 text-sm text-muted">
            <UButton size="sm" variant="link" color="neutral" to="https://github.com/hugorcd/shelve/issues/new/choose" target="_blank">
              Report an issue
            </UButton>
            or
            <UButton size="sm" variant="link" color="neutral" :to="editThisPage.to" target="_blank">
              Edit this page on GitHub
            </UButton>
          </div>
        </Divider>
        <Surround :surround="(surround as any)" />
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
</template>
