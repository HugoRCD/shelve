<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { findPageBreadcrumb, mapContentNavigation } from '#ui-pro/utils/content'

const route = useRoute()

const { data: page } = await useAsyncData(route.path, () =>
  queryCollection('content').path(route.path).first()
)

const { data: surround } = await useAsyncData(`${route.path}-surround`, () => {
  return queryCollectionItemSurroundings('content', route.path, {
    fields: ['description']
  })
})

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const breadcrumb = computed(() => mapContentNavigation(findPageBreadcrumb(navigation?.value, page.value)).map(({ icon, ...link }) => link))

defineOgImageComponent('Docs', {
  headline: breadcrumb.value.map(item => item.label).join(' > ')
})
</script>

<template>
  <div>
    <ShelveMeta :default-og-image="false" :title="page?.title" :description="page?.description" />
    <UPage v-if="page">
      <UPageHeader :title="page.title">
        <template #headline>
          <UBreadcrumb :items="breadcrumb" />
        </template>

        <!--      <template #description>
          <MDC v-if="page.description" :value="page.description" unwrap="p" />
        </template>-->

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

        <USeparator />

        <UContentSurround :surround="(surround as any)" />
      </UPageBody>

      <template v-if="page?.body?.toc?.links?.length" #right>
        <UContentToc :links="page.body.toc.links" class="z-[2]" />
      </template>
    </UPage>
  </div>
</template>
