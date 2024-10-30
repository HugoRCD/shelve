<script setup lang="ts">
definePageMeta({
  colorMode: 'dark',
})

useHead({
  title: 'Roadmap'
})

const appConfig = useAppConfig()

const token = 'eyJ2aWV3IjoiYm9hcmQiLCJib2FyZFN0YXR1c2VzIjpbInRyaWFnZSIsImJhY2tsb2ciLCJ0b2RvIiwiaW5fcHJvZ3Jlc3MiLCJpbl9yZXZpZXciLCJkb25lIiwicmVsZWFzZWQiLCJjYW5jZWxsZWQiXSwiYm9hcmRMaW5rZWRQcnMiOnRydWUsImxpc3RHcm91cCI6InN0YXR1cyIsImxpc3RPcmRlciI6ImNyZWF0ZWRfYXQiLCJ0aW1lbGluZVpvb20iOiJtb250aCIsInRpbWVsaW5lT3JkZXIiOiJzdGF0ZSIsInRpbWVsaW5lRGlzcGxheSI6ImFsbF9taWxlc3RvbmVzIiwiZmlsdGVycyI6e30sIm93bmVyIjoiSHVnb1JDRCIsIm5hbWUiOiJzaGVsdmUifQ=='

const src = computed(() => `https://volta.net/embed/${token}?gray=${appConfig.ui.gray}&primary=${appConfig.ui.primary}`)
</script>

<template>
  <div class="flex size-full items-center justify-center">
    <ClientOnly>
      <iframe :src width="100%" height="100%" />
    </ClientOnly>
  </div>
</template>
