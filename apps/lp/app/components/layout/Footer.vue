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
  <UFooter :ui="{ top: 'py-0 lg:py-0' }">
    <template #top>
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
      <USeparator icon="custom:shelve" type="dashed" />
    </template>


    <template #left>
      <div class="text-xs font-mono italic tracking-tight text-neutral-500">
        © {{ new Date().getFullYear() }} - Made by <NuxtLink to="https://hrcd.fr/" class="text-neutral-400 hover:text-neutral-200">
          HugoRCD
        </NuxtLink>
      </div>
    </template>

    <template #right>
      <div class="flex items-center gap-2">
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
        <div style="color-scheme: none;">
          <iframe src="https://status.shelve.cloud/badge?theme=dark" height="30" width="200" />
        </div>
      </div>
    </template>
  </UFooter>
</template>
