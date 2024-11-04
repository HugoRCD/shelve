<script setup lang="ts">
const items = [
  {
    label: 'Is Vault by Shelve is secure?',
    icon: 'lucide:shield',
    content: 'Yes, Vault by Shelve is secure. We use industry-standard encryption (AES-256) to protect your data. We never store your secrets in plain text, and we never share your data with third parties. You can also check the source code on GitHub to verify our security practices.',
  },
  {
    label: 'How can I contact the Shelve team?',
    icon: 'lucide:mail',
    content: 'For the moment you can send me an email at contact@hrcd.fr',
  }
]
</script>

<template>
  <div class="mt-8 flex w-full max-w-2xl flex-col gap-4 px-5">
    <div class="flex flex-col items-center justify-center">
      <h3 class="main-gradient text-2xl">
        <LandingScrambleText label="FAQ" />
      </h3>
      <p class="max-w-lg text-center text-sm text-neutral-500 sm:text-base">
        Frequently asked questions about Vault.
      </p>
    </div>
    <UAccordion
      color="neutral"
      variant="ghost"
      size="sm"
      :items
    />
  </div>
</template>
