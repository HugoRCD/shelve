<script lang="ts" setup>
const props = defineProps<{
  /*
   * The scroll % of the navbar
   */
  scroll: number
}>()

const items = [
  {
    label: 'Vault',
    to: '/vault',
  },
  {
    to: '/blog',
    label: 'Blog',
  },
  {
    label: 'Features',
    slot: 'features',
    children: [
      {
        label: 'Push / Pull',
        description: 'Sync your secrets with Shelve',
        icon: 'heroicons:arrows-up-down-solid',
        to: '/cli/push-pull'
      },
      {
        label: 'Github secrets',
        description: 'Send your secrets on Github',
        icon: 'simple-icons:github',
        to: '/integrations/github'
      },
      {
        to: '/roadmap',
        label: 'Roadmap',
        icon: 'heroicons:map-solid',
        description: 'See what\'s coming next',
      }
    ]
  },
  {
    label: 'Docs',
    children: [
      {
        to: '/getting-started',
        label: 'Getting Started',
        icon: 'heroicons:book-open-solid',
        description: 'Learn how to use Shelve'
      },
      {
        to: '/getting-started/installation',
        label: 'Installation',
        icon: 'heroicons:inbox-arrow-down-solid',
        description: 'Install Shelve on your machine'
      },
      {
        to: '/cli',
        label: 'CLI',
        icon: 'heroicons:command-line-solid',
        description: 'Learn how to use the Shelve CLI'
      },
      {
        to: '/self-hosting/docker',
        label: 'Self-Hosting',
        icon: 'heroicons:server-stack-solid',
        description: 'Host Shelve on your own infrastructure'
      }
    ]
  },
  {
    label: 'Company',
    children: [
      {
        label: 'About',
        to: '/about',
        icon: 'heroicons:question-mark-circle-solid',
        description: 'Meet the team behind Shelve'
      },
      {
        label: 'Brand',
        to: '/brand',
        icon: 'heroicons:photo-solid',
        description: 'Assets and guidelines'
      },
      {
        to: 'mailto:contact@shelve.cloud',
        label: 'Contact',
        icon: 'heroicons:envelope-solid',
        description: 'Get in touch with us'
      },
    ]
  }
]

const headerUi = computed(() => ({
  root: [
    '@container fixed mt-2 px-0 rounded-xl py-2 transition-all duration-500 left-1/2 -translate-x-1/2',
    props.scroll > 0.02 ? 'bg-neutral-950/50 backdrop-blur-lg' : 'bg-transparent backdrop-blur-none',
    props.scroll > 0.02 ? 'border' : 'border-transparent',
    props.scroll > 0.005 ? '[--header-width:90%] sm:[--header-width:60%]' : '[--header-width:100%]',
    'w-[var(--header-width)]'
  ] as never as string,
  container: 'h-fit',
  center: '@min-[620px]:flex',
  toggle: '@min-[620px]:hidden',
  body: 'py-0'
}))

const navigationUi = computed(() => ({
  item: 'py-0',
  linkTrailingIcon: 'hidden',
  viewport: 'bg-neutral-950 font-mono',
  viewportWrapper: 'w-[600px] transition-all duration-500 left-1/2 -translate-x-1/2',
}))
</script>

<template>
  <div class="z-[99] flex justify-center">
    <Blur position="both" />
    <UHeader mode="drawer" :ui="headerUi">
      <template #left>
        <Logo />
      </template>

      <UNavigationMenu variant="link" color="neutral" :items :ui="navigationUi">
        <template #features-content="{ item }">
          <div class="flex flex-row p-2 gap-2">
            <div class="row-span-3 flex-1">
              <Callout class="h-full p-6 opacity-70">
                <span class="text-xs">
                  > explore shelve features
                  Discover a better way to manage env variables. Built by developers, for developers.
                </span>
              </Callout>
            </div>
            <ul class="flex flex-col gap-1">
              <li v-for="child in item.children" :key="child.label">
                <ULink class="text-sm w-full text-left rounded-md p-3 transition-colors hover:bg-[var(--ui-bg-elevated)]/50">
                  <p class="font-medium text-[var(--ui-text-highlighted)]">
                    {{ child.label }}
                  </p>
                  <p class="text-[var(--ui-text-muted)] line-clamp-2">
                    {{ child.description }}
                  </p>
                </ULink>
              </li>
            </ul>
          </div>
        </template>
      </UNavigationMenu>

      <template #right>
        <div class="flex items-center gap-2">
          <div>
            <UButton size="sm" @click="navigateTo(`https://app.shelve.cloud/login`, { external: true })">
              Open App
              <UKbd value="S" />
            </UButton>
          </div>
        </div>
      </template>

      <template #content>
        <UNavigationMenu :items orientation="vertical" class="-mx-2.5" />
      </template>
    </UHeader>
  </div>
</template>
