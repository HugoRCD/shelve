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
    <Body class="relative font-geist text-black selection:bg-accent-600 selection:text-inverted dark:bg-neutral-950 dark:text-white">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
      <Toaster position="top-center" />
    </Body>
  </Html>
</template>

