<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { findPageBreadcrumb, mapContentNavigation } from '#ui-pro/utils/content'

const route = useRoute()

const { data: page } = await useAsyncData(route.path, () =>
  queryCollection('content').path(route.path).first()
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
  <div>
    <ShelveMeta :default-og-image="false" :title="page?.title" :description="page?.description" />
    <UPage v-if="page">
      <UPageHeader :title="page.title">
        <template #headline>
          <UBreadcrumb :items="breadcrumb" />
        </template>

        <template #description>
          <p class="text-neutral-500">
            {{ page.description }}
          </p>
        </template>

        <template v-if="page.links?.length" #links>
          <UButton
            v-for="link in page.links"
            :key="link.label"
            color="neutral"
            variant="outline"
            :target="link.to.startsWith('http') ? '_blank' : undefined"
            v-bind="link"
          >
            <template v-if="link.avatar" #leading>
              <UAvatar v-bind="link.avatar" size="2xs" />
            </template>
          </UButton>
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
  </div>
</template>
