<script setup lang="ts">
const items = [
  {
    label: 'Is Shelve free?',
    defaultOpen: true,
    content: 'Yes! Shelve is completely free and open-source. While we may introduce additional features in the future, our core functionality will always remain free and accessible to everyone.',
  },
  {
    label: 'Is Shelve secure?',
    content: 'Security is our top priority. We use industry-standard **encryption (AES-256)** to protect your data, and all variables are encrypted at rest. Being open-source, our security practices are transparent and can be audited by anyone on GitHub.',
  },
  {
    label: 'Can I self-host Shelve?',
    content: 'Absolutely! Shelve can be [self-hosted using Docker](/docker) or with one-click using [Coolify](/coolify). Self-hosting gives you full control over your data and infrastructure.',
  },
  {
    label: 'Does Shelve integrate with other tools?',
    content: 'Yes! Shelve currently integrates with GitHub for secrets management, with more integrations planned. You can sync your environment variables directly with [GitHub Secrets](/integrations/github).',
  },
  {
    label: 'How can I contribute to Shelve?',
    content: 'We welcome contributions! You can contribute by submitting PRs, reporting bugs, suggesting features, or improving our documentation. Check our [Contributing Guide](/contributing) to get started.',
  },
  {
    label: 'Is Shelve production-ready?',
    content: `Yes, Shelve is being actively used in production environments. While we're constantly adding new features, the core functionality is stable and reliable.`,
  },
  {
    label: 'How can I get support?',
    content: 'For technical support, you can open an issue on [GitHub](https://git.new/shelve) or reach out via email at contact@shelve.cloud.',
  }
]
</script>

<template>
  <div id="faq">
    <div class="mb-10 flex flex-col items-center justify-center gap-2">
      <h3 class="main-gradient text-3xl">
        <ScrambleText label="FAQ" />
      </h3>
      <p class="max-w-lg text-center text-sm text-neutral-500 sm:text-base">
        Frequently asked questions about Shelve. If you have a question that is not answered here, feel free to contact us.
      </p>
      <UButton to="mailto:contact@shelve.cloud" label="Contact us" size="sm" class="mt-2" />
    </div>
    <div>
      <UPageAccordion size="sm" :items>
        <template #body="{ item }">
          <MDC :value="item.content" unwrap="p" />
        </template>
      </UPageAccordion>
    </div>
  </div>
</template>
