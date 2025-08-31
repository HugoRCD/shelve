<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { kebabCase } from 'scule'
import { findPageBreadcrumb } from '@nuxt/content/utils'
import { mapContentNavigation } from '@nuxt/ui/utils/content'

const route = useRoute()

const { data: page } = await useAsyncData(kebabCase(route.path), () => queryCollection('blog').path(route.path).first())
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const { data: surround } = await useAsyncData(`${kebabCase(route.path)}-surround`, () => {
  return queryCollectionItemSurroundings('blog', route.path, {
    fields: ['description']
  })
})

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation', ref([]))

const breadcrumb = computed(() => mapContentNavigation(findPageBreadcrumb(navigation.value, page.value?.path)).map(link => ({
  label: link.label,
  to: link.to
})))

if (page.value.image) {
  defineOgImage({ url: page.value.image })
} else {
  defineOgImageComponent('Docs', {
    headline: breadcrumb.value.map(item => item.label).join(' > ')
  }, {
    fonts: ['Geist:400', 'Geist:600'],
  })
}

const title = page.value.seo?.title || page.value.title
const description = page.value.seo?.description || page.value.description
const titleTemplate = ref('%s - Shelve Blog')

useSeoMeta({
  title,
  titleTemplate,
  description,
  ogDescription: description,
  ogTitle: titleTemplate.value?.includes('%s') ? titleTemplate.value.replace('%s', title) : title
})

const editThisPage = computed(() => ({
  icon: 'i-heroicons-pencil-square-solid',
  label: 'Edit this page',
  to: `https://github.com/hugorcd/shelve/edit/main/apps/lp/content/${page?.value?.stem}.md`,
  target: '_blank'
}))
const articleLink = computed(() => `${window.location}${page.value?.path}`)

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <UPage v-if="page" class="mt-20 px-2">
    <UContainer class="flex flex-col items-center gap-3 mt-8">
      <div class="flex items-center gap-2">
        <ULink to="/blog" class="text-sm">
          Blog
        </ULink>
        <span class="text-sm">/</span>
        <span class="text-sm">
          {{ page.word }}
        </span>
      </div>
      <NuxtImg
        :src="page.image"
        :alt="page.title"
        class="rounded-lg w-full h-[250px] object-cover object-center"
      />
      <div class="flex text-xs text-muted items-center justify-center gap-2">
        <span>
          {{ formatDate(page.date) }}
        </span>
        -
        <span>
          {{ page.minRead }} MIN READ
        </span>
      </div>
      <h1 class="text-4xl main-gradient text-center max-w-3xl mx-auto">
        {{ page.title }}
      </h1>
      <p class="text-muted text-center max-w-2xl mx-auto">
        {{ page.description }}
      </p>
      <div class="flex items-center justify-center gap-2 mt-2">
        <UUser
          v-for="(author, index) in page.authors"
          :key="index"
          orientation="vertical"
          color="neutral"
          variant="outline"
          class="justify-center items-center text-center"
          v-bind="author"
        />
      </div>
    </UContainer>
    <UPageBody class="max-w-3xl mx-auto">
      <Divider class="mt-4" />
      <ContentRenderer v-if="page.body" :value="page" />

      <Divider class="my-10">
        <div class="flex items-center gap-2 text-sm text-muted">
          <UButton
            size="sm"
            variant="link"
            color="neutral"
            label="Copy link"
            @click="copyToClipboard(articleLink, 'Article link copied to clipboard')"
          />
          -
          <UButton
            size="sm"
            variant="link"
            color="neutral"
            :to="editThisPage.to"
            target="_blank"
            label="Edit this page on GitHub"
          />
        </div>
      </Divider>
      <Surround :surround="(surround as any)" />
    </UPageBody>
  </UPage>
</template>
