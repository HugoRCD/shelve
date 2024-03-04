<script setup lang="ts">
const { title, link } = useAppConfig();
useHead({
  title: title,
  link: link,
});

await useSession().refresh();
</script>

<template>
  <Html>
    <Body class="relative bg-primary text-primary">
      {{ useSession().user }}
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
      <Toasts />
    </Body>
  </Html>
</template>

