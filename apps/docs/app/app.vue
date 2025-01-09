<script setup lang="ts">
const route = useRoute()

const { data } = await useAsyncData(route.path, () =>
  queryCollection('content').path(route.path).first()
)
</script>
<template>
  <UApp>
    <ContentRenderer :value="data" />
  </UApp>
</template>
