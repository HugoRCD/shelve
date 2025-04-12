<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { kebabCase } from 'scule'
import { findPageBreadcrumb, mapContentNavigation } from '#ui-pro/utils/content'

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
  useAsyncData(kebabCase(path.value), () => paintResponse().then(() => nuxtApp.static[kebabCase(path.value)] ?? queryCollection('blog').path(path.value).first()), {
    watch: [path]
  }),
  useAsyncData(`${kebabCase(path.value)}-surround`, () => paintResponse().then(() => nuxtApp.static[`${kebabCase(path.value)}-surround`] ?? queryCollectionItemSurroundings('blog', path.value, {
    fields: ['description']
  })), { watch: [path] })
])

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation', ref([]))
const blogNavigation = computed(() => navigation.value.find(item => item.path === '/blog')?.children || [])

const breadcrumb = computed(() => mapContentNavigation(findPageBreadcrumb(blogNavigation?.value, page.value)).map(({ icon, ...link }) => link))

if (page.value.image) {
  useSeoMeta({
    ogImage: page.value.image,
    twitterImage: page.value.image
  })
} else {
  defineOgImageComponent('Docs', {
    headline: breadcrumb.value.map(item => item.label).join(' > ')
  }, {
    fonts: ['Geist:400', 'Geist:600'],
  })
}

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
    <UContainer class="relative min-h-screen">
      <UPage v-if="page">
        <ULink to="/blog" class="text-sm flex items-center gap-1">
          <UIcon name="lucide:chevron-left" />
          Blog
        </ULink>
        <div class="flex flex-col gap-3 mt-8">
          <NuxtImg
            :src="page.image"
            :alt="page.title"
            class="rounded-lg w-full h-[250px] object-cover object-center"
          />
          <div class="flex text-xs text-(--ui-text-muted) items-center justify-center gap-2">
            <span>
              {{ page.date }}
            </span>
            -
            <span>
              {{ page.minRead }} MIN READ
            </span>
          </div>
          <h1 class="text-4xl main-gradient text-center">
            {{ page.title }}
          </h1>
          <p class="text-(--ui-text-muted) text-center max-w-2xl mx-auto">
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
        </div>
        <UPageBody class="leading-relaxed">
          <Divider class="mt-4" />
          <ContentRenderer v-if="page.body" :value="page" />

          <USeparator class="my-10">
            <div class="flex items-center gap-2 text-sm text-(--ui-text-muted)">
              <UButton size="sm" variant="link" color="neutral" :to="editThisPage.to" target="_blank">
                Edit this page on GitHub
              </UButton>
            </div>
          </USeparator>
          <UContentSurround :surround />
        </UPageBody>
      </UPage>
    </UContainer>
  </UMain>
</template>
