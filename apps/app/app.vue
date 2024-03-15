<script setup lang="ts">
import { Toaster } from "vue-sonner";

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
    <Body class="selection:bg-primary relative font-geist text-black selection:text-inverted dark:bg-neutral-950 dark:text-white">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
      <Toaster
        position="bottom-right"
        :theme="$colorMode.preference === 'dark' ? 'dark' : 'light'"
      />
    </Body>
  </Html>
</template>

