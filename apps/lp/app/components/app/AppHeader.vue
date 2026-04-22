<script setup lang="ts">
const items = [
  {
    label: 'Features',
    slot: 'features',
    children: [
      {
        label: 'Push / Pull',
        description: 'Sync your secrets with Shelve',
        icon: 'heroicons:arrows-up-down-solid',
        to: '/docs/cli/push-pull',
      },
      {
        label: 'Github secrets',
        description: 'Send your secrets on Github',
        icon: 'simple-icons:github',
        to: '/docs/integrations/github',
      },
      {
        label: 'Roadmap',
        icon: 'heroicons:map-solid',
        description: 'See what\'s coming next',
        to: '/roadmap',
      },
    ],
  },
  {
    label: 'Docs',
    to: '/docs/getting-started',
    children: [
      {
        label: 'Getting Started',
        icon: 'heroicons:book-open-solid',
        description: 'Learn how to use Shelve',
        to: '/docs/getting-started',
      },
      {
        label: 'Quickstart',
        icon: 'heroicons:inbox-arrow-down-solid',
        description: 'Install Shelve on your machine',
        to: '/docs/getting-started/quickstart',
      },
      {
        label: 'CLI',
        icon: 'heroicons:command-line-solid',
        description: 'Learn how to use the Shelve CLI',
        to: '/docs/cli',
      },
      {
        label: 'Self-Hosting',
        icon: 'heroicons:server-stack-solid',
        description: 'Host Shelve on your own Vercel account',
        to: '/docs/self-hosting/vercel',
      },
    ],
  },
  {
    label: 'Blog',
    to: '/blog',
  },
  {
    label: 'Company',
    children: [
      {
        label: 'About',
        icon: 'heroicons:question-mark-circle-solid',
        description: 'Meet the team behind Shelve',
        to: '/about',
      },
      {
        label: 'Brand',
        icon: 'heroicons:photo-solid',
        description: 'Assets and guidelines',
        to: '/brand',
      },
      {
        label: 'Contact',
        icon: 'heroicons:envelope-solid',
        description: 'Get in touch with us',
        to: 'mailto:contact@shelve.cloud',
      },
    ],
  },
  {
    label: 'Vault',
    to: 'https://vault.shelve.cloud',
    target: '_blank',
  },
]

const ui = computed(() => ({
  childLink: 'hover:bg-default/50',
  childLinkLabel: '',
  linkTrailingIcon: 'hidden',
  viewport: 'bg-muted ring ring-offset-6 ring-offset-(--ui-bg) ring-default border border-default',
  viewportWrapper: 'w-[700px] transition-all duration-500 left-1/2 -translate-x-1/2',
}))

const { isEnabled: isAssistantEnabled } = useAssistant()

const route = useRoute()
const isLanding = computed(() => route.path === '/')

const headerUi = computed(() => isLanding.value
  ? { root: 'fixed inset-x-0 top-0 bg-transparent backdrop-blur-none border-transparent z-50', left: 'min-w-0' }
  : { left: 'min-w-0' })

const { data: llms, refresh: refreshLlms } = useFetch<string>('/llms.txt', {
  immediate: false,
})

defineShortcuts({
  meta_g: () => {
    window.open('https://github.com/hugorcd/shelve', '_blank')
  },
  meta_shift_m: async () => {
    await refreshLlms()
    if (llms.value) copyToClipboard(llms.value, 'llms.txt copied!')
  },
})
</script>

<template>
  <Blur v-if="isLanding" position="both" class="z-10" />
  <UHeader
    :ui="headerUi"
    :menu="{ shouldScaleBackground: true }"
  >
    <template #left>
      <NuxtLink to="/" aria-label="Shelve">
        <AppHeaderLogo />
      </NuxtLink>
    </template>

    <UNavigationMenu variant="link" color="neutral" :items :ui>
      <template #features-content="{ item }">
        <div class="flex flex-row gap-2 p-2">
          <div class="w-1/2">
            <NuxtImg
              preload
              format="webp"
              src="/og.png"
              alt="Shelve"
              class="size-full rounded-md object-cover"
            />
          </div>
          <ul class="flex w-1/2 flex-col gap-1">
            <li v-for="child in item.children" :key="child.label">
              <ULink
                class="hover:bg-elevated/50 w-full cursor-pointer rounded-md p-3 text-left text-sm transition-colors"
                @click="navigateTo(child.to)"
              >
                <p class="text-highlighted font-medium">
                  {{ child.label }}
                </p>
                <p class="text-muted line-clamp-2">
                  {{ child.description }}
                </p>
              </ULink>
            </li>
          </ul>
        </div>
      </template>
    </UNavigationMenu>

    <template #right>
      <AppHeaderCTA />

      <template v-if="isAssistantEnabled">
        <AssistantChat />
      </template>

      <UContentSearchButton class="lg:hidden" />

      <UTooltip text="Open on GitHub" :kbds="['meta', 'G']" class="hidden lg:flex">
        <UButton
          color="neutral"
          variant="ghost"
          to="https://github.com/hugorcd/shelve"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
        />
      </UTooltip>

      <ClientOnly>
        <UColorModeButton />
        <template #fallback>
          <div class="bg-elevated size-8 animate-pulse rounded-md" />
        </template>
      </ClientOnly>
    </template>

    <template #body>
      <UNavigationMenu :items orientation="vertical" class="-m-2.5" />
    </template>
  </UHeader>
</template>
