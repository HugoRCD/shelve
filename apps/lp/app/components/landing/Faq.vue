<script setup lang="ts">
const items = [
  {
    label: 'Is Shelve free?',
    icon: 'lucide:wallet',
    defaultOpen: true,
    content: 'Yes, Shelve is under heavy development and is currently free to use. We may introduce a paid plan in the future, but the free plan will always be available.',
  },
  {
    label: 'Is Shelve secure?',
    icon: 'lucide:lock',
    content: 'Yes, Shelve is secure. We use industry-standard encryption (AES-256) to protect your data. We never store your secrets in plain text, and we never share your data with third parties. You can also check the source code on GitHub to verify our security practices.',
  },
  {
    label: 'How can I contribute to Shelve?',
    icon: 'lucide:github',
    content: 'You can contribute to Shelve by submitting a pull request to the GitHub repository. You can also contribute by reporting bugs, suggesting features, or sharing Shelve with your friends.',
  },
  {
    label: 'Is Shelve open source?',
    icon: 'lucide:code',
    content: 'Yes, Shelve is open source. You can view the source code on GitHub and contribute to the project if you wish.',
  },
  {
    label: 'How can I contact the Shelve team?',
    icon: 'lucide:mail',
    content: 'For the moment you can send me an email at contact@hrcd.fr',
  }
]
</script>

<template>
  <div>
    <div class="mb-10 flex flex-col items-center justify-center gap-2">
      <h3 class="main-gradient text-2xl">
        <LandingScrambleText label="FAQ" />
      </h3>
      <p class="max-w-lg text-center text-sm text-neutral-500 sm:text-base">
        Frequently asked questions about Shelve.
      </p>
    </div>
    <div class="mx-auto max-w-3xl">
      <UAccordion
        color="neutral"
        variant="ghost"
        size="sm"
        :items
      />
    </div>
  </div>
</template>
