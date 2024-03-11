<script setup lang="ts">
const { title, link } = useAppConfig();
useHead({
  title: title,
  link: link,
});

function setPrefersReducedMotion(reduceMotion: boolean) {
  if (reduceMotion) {
    document.documentElement.setAttribute("data-reduce-motion", "reduce");
  } else {
    document.documentElement.removeAttribute("data-reduce-motion");
  }
}

if (process.client) {
  const reduceMotion = useCookie<boolean>("reduceMotion", {
    watch: true,
  });

  setPrefersReducedMotion(reduceMotion.value);
}

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

