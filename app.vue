<script setup lang="ts">
const { title, link } = useAppConfig();
useHead({
  title: title,
  link: link,
});
</script>

<template>
  <Html>
    <Body class="relative bg-primary text-primary">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
      <Toasts close-button />
    </Body>
  </Html>
</template>

