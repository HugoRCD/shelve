<script setup lang="ts">
useHead({
  title: 'Roadmap',
  titleTemplate: '%s - Shelve',
})

const appConfig = useAppConfig()

const token = 'eyJ2aWV3IjoiYm9hcmQiLCJib2FyZFN0YXR1c2VzIjpbInRyaWFnZSIsImJhY2tsb2ciLCJ0b2RvIiwiaW5fcHJvZ3Jlc3MiLCJpbl9yZXZpZXciLCJkb25lIiwicmVsZWFzZWQiLCJjYW5jZWxsZWQiXSwiYm9hcmRMaW5rZWRQcnMiOnRydWUsImxpc3RHcm91cCI6InN0YXR1cyIsImxpc3RPcmRlciI6ImNyZWF0ZWRfYXQiLCJ0aW1lbGluZVpvb20iOiJtb250aCIsInRpbWVsaW5lT3JkZXIiOiJzdGF0ZSIsInRpbWVsaW5lRGlzcGxheSI6ImFsbF9taWxlc3RvbmVzIiwiZmlsdGVycyI6e30sIm93bmVyIjoiSHVnb1JDRCIsIm5hbWUiOiJzaGVsdmUifQ=='

const src = computed(() => `https://volta.net/embed/${token}?neutral=${appConfig.ui.colors.neutral}&primary=${appConfig.ui.colors.primary}`)
</script>

<template>
  <div class="h-[calc(100vh-var(--ui-header-height))]">
    <ClientOnly>
      <iframe :src width="100%" height="100%" />
    </ClientOnly>
  </div>
</template>
