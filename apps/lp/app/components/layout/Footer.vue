<script setup lang="ts">
import type { FooterColumn } from '@nuxt/ui-pro'

type RepoType = {
  stars: number
}

const githubStars = ref('0')

const email = ref('')

async function fetchRepo() {
  try {
    const res = await $fetch('https://ungh.cc/repos/hugorcd/shelve') as { repo: RepoType }
    githubStars.value = res.repo.stars.toString()
  } catch (e) { /* empty */ }
}

await fetchRepo()

const columns: FooterColumn[] = [
  {
    label: 'Product',
    children: [
      {
        label: 'Roadmap',
        to: '/roadmap'
      },
      {
        label: 'Releases',
        to: 'https://github.com/hugorcd/shelve/releases',
        target: '_blank'
      }
    ]
  },
  {
    label: 'Resources',
    children: [
      {
        label: 'Documentation',
        to: '/docs/getting-started'
      },
      {
        label: 'Blog',
        to: '/blog'
      },
      {
        label: 'Brand Assets',
        to: '/brand'
      },
      {
        label: 'LLM.txt',
        to: 'https://shelve.cloud/llms.txt',
        target: '_blank'
      }
    ]
  },
  {
    label: 'Legal',
    children: [
      {
        label: 'Privacy Policy',
        to: '/legal/privacy'
      },
      {
        label: 'Terms of Service',
        to: '/legal/terms'
      }
    ]
  }
]
</script>

<template>
  <USeparator icon="custom:shelve" class="h-px z-20" />
  
  <UFooter :ui="{ top: 'border-b border-default', root: 'bg-default z-10' }">
    <template #top>
      <UContainer>
        <UFooterColumns :columns>
          <template #right>
            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-2">
                <h3 class="text-sm font-semibold text-highlighted">
                  Stay Updated
                </h3>
                <p class="text-xs text-muted">
                  Follow our development and get the latest updates
                </p>
              </div>
              <div class="flex flex-col gap-2">
                <UFormField>
                  <UTooltip text="Coming soon">
                    <UInput
                      v-model="email"
                      placeholder="Email"
                      type="email"
                      class="w-full"
                      disabled
                      :ui="{ base: 'rounded-none' }"
                    />
                  </UTooltip>
                </UFormField>
                <div style="color-scheme: none;" class="w-full">
                  <iframe 
                    src="https://status.shelve.cloud/badge?theme=dark" 
                    height="30" 
                    width="100%" 
                    class="rounded border-none"
                  />
                </div>
              </div>
            </div>
          </template>
        </UFooterColumns>
      </UContainer>
    </template>

    <template #left>
      <div class="text-xs font-mono italic tracking-tight">
        <span class="text-muted"> © {{ new Date().getFullYear() }} - Made by </span>
        <ULink to="https://hrcd.fr/" class="hover:underline">
          HugoRCD
        </ULink>
      </div>
    </template>

    <template #right>
      <UButton
        color="neutral"
        variant="ghost"
        to="https://x.com/shelvecloud"
        target="_blank"
        icon="i-simple-icons-x"
        size="sm"
      >
        <span class="sr-only">Shelve on X</span>
      </UButton>
      <UButton
        color="neutral"
        variant="ghost"
        to="https://github.com/hugorcd/shelve"
        target="_blank"
        icon="i-simple-icons-github"
        size="sm"
      >
        <span class="sr-only">Shelve on GitHub</span>
      </UButton>
      <UButton
        color="neutral"
        variant="ghost"
        to="https://discord.gg/shelve"
        target="_blank"
        icon="i-simple-icons-discord"
        size="sm"
      >
        <span class="sr-only">Shelve on Discord</span>
      </UButton>
      <UColorModeButton size="sm" />
    </template>
  </UFooter>
</template>
