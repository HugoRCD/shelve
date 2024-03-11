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
    <Body class="bg-gray selection:bg-accent relative font-geist text-black selection:text-inverted dark:text-white">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
      <Toaster />
    </Body>
  </Html>
</template>

