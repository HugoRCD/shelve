<script setup lang="ts">
const route = useRoute()

const columns = ref([
  {
    label: 'Support',
    icon: 'lucide:life-buoy',
    children: [
      {
        label: 'Documentation',
        to: '/getting-started',
      },
      {
        label: 'FAQ',
        to: '#faq',
        active: route.hash === '#faq',
      },
      {
        label: 'Roadmap',
        to: '/roadmap',
      },
    ],
  },
  {
    label: 'Community',
    icon: 'lucide:users',
    children: [
      {
        label: 'GitHub',
        to: 'https://github.com/HugoRCD/shelve/issues',
        target: '_blank'
      },
      {
        label: 'X / Twitter',
        to: 'https://twitter.com/shelvecloud',
        target: '_blank'
      }
    ],
  },
  {
    label: 'Legal',
    icon: 'lucide:shield',
    children: [
      {
        label: 'Privacy',
        to: '#privacy',
      },
      {
        label: 'Terms',
        to: '#terms',
      },
    ],
  },
])
</script>

<template>
  <UFooter class="pb-12" :ui="{ top: 'py-0 lg:py-6' }">
    <template #top>
      <div class="flex">
        <NuxtLink to="/getting-started" class="group -mb-px -ml-px flex w-full cursor-pointer justify-between gap-2 border border-neutral-800 border-opacity-50 p-4 text-xs text-neutral-500 transition-all duration-300 ease-in-out hover:border-opacity-100 hover:bg-neutral-800/50 hover:text-neutral-200">
          Documentation
          <UIcon name="lucide:arrow-right" class="ml-1 inline-block text-neutral-400 transition-all duration-300 ease-in-out group-hover:-rotate-45" />
        </NuxtLink>
        <NuxtLink
          to="https://app.shelve.cloud/login"
          class="group -mb-px -ml-px flex w-full cursor-pointer justify-between gap-2 border border-neutral-800 border-opacity-50 p-4 text-xs text-neutral-500 transition-all duration-300 ease-in-out hover:border-opacity-100 hover:bg-neutral-800/50 hover:text-neutral-200"
        >
          Login
          <UIcon name="lucide:arrow-right" class="ml-1 inline-block text-neutral-400 transition-all duration-300 ease-in-out group-hover:-rotate-45" />
        </NuxtLink>
      </div>

      <UContainer>
        <UFooterColumns :columns class="py-6">
          <template #right>
            <UTooltip text="Coming soon...">
              <UFormField name="email" label="Subscribe to our newsletter" size="lg">
                <UInput type="email" class="w-full" placeholder="Enter your email" disabled>
                  <template #trailing>
                    <UButton type="submit" size="xs" color="neutral" label="Subscribe" disabled />
                  </template>
                </UInput>
              </UFormField>
            </UTooltip>
          </template>
        </UFooterColumns>
      </UContainer>
      <USeparator icon="custom:shelve" />
    </template>

    <div class="text-xs text-neutral-500">
      © {{ new Date().getFullYear() }} - Made by <NuxtLink to="https://hrcd.fr/" class="text-neutral-400 hover:text-neutral-200">
        HugoRCD
      </NuxtLink>
    </div>

    <template #left>
      <div style="color-scheme: none;" class="max-sm:hidden">
        <iframe src="https://status.shelve.cloud/badge?theme=dark" height="30" />
      </div>
    </template>

    <template #right>
      <UButton
        icon="i-simple-icons-x"
        color="neutral"
        variant="ghost"
        to="https://x.com/shelvecloud"
        target="_blank"
        aria-label="X"
      />
      <UButton
        icon="i-simple-icons-github"
        color="neutral"
        variant="ghost"
        to="https://github.com/hugorcd/shelve"
        target="_blank"
        aria-label="GitHub"
      />
    </template>
  </UFooter>
</template>
