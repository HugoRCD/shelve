<script setup lang="ts">
import { Toaster } from "vue-sonner";

const { title, link } = useAppConfig();
useHead({
  title: title,
  link: link,
  script: [
    {
      src: "https://eu.umami.is/script.js",
      defer: true,
      "data-website-id": "24a47d51-4629-4f67-af04-1e2242761c67",
    },
  ],
});

function setPrefersReducedMotion(reduceMotion: boolean) {
  if (reduceMotion) {
    document.documentElement.setAttribute("data-reduce-motion", "reduce");
  } else {
    document.documentElement.removeAttribute("data-reduce-motion");
  }
}

const reduceMotion = useCookie<boolean>("reduceMotion", {
  watch: true,
});

if (process.client) setPrefersReducedMotion(reduceMotion.value);


await useSession().refresh();
</script>

<template>
  <Html>
    <Body class="selection:bg-primary relative font-geist text-black selection:text-inverted dark:bg-neutral-950 dark:text-white">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
      <Toaster
        position="top-center"
      />
    </Body>
  </Html>
</template>

