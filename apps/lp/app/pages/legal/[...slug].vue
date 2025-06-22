<script setup lang="ts">
const route = useRoute()

const { data: page } = await useAsyncData(`legal-${route.path}`, () => {
  return queryCollection('legal').path(route.path).first()
})

if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Legal document not found'
  })
}

useSeoMeta({
  title: page.value.title,
  description: page.value.description
})
</script>

<template>
  <UPage class="mx-auto max-w-5xl my-6 sm:my-10">
    <ContentRenderer v-if="page" :value="page" />

    <template v-if="page?.body?.toc?.links?.length" #right>
      <UContentToc :links="page.body?.toc?.links" highlight class="lg:backdrop-blur-none" />
    </template>
  </UPage>
</template> 
