<script setup lang="ts">
const { title, link } = useAppConfig();
useHead({
  title: title,
  link: link,
  meta: [
    { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" },
    { name: "author", content: "Hugo Richard" },
    { charset: "utf-8" },
    {
      name: "description",
      content:
        "Currencia is the simplest crypto tracker, with a clean and minimalistic design, you can quickly be up to date with the latest crypto news and prices.",
    },
    {
      name: "keywords",
      content: "crypto, tracker, bitcoin, ethereum, litecoin, dogecoin, ripple, binance, coinbase, kraken, crypto news, crypto prices",
    },
  ],
});
</script>

<template>
  <Html>
    <Body class="relative bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
      <Toasts close-button />
    </Body>
  </Html>
</template>

