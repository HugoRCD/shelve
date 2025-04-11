<script setup lang="ts">
type RepoType = {
  stars: number
}

const githubStars = ref('0')
async function fetchRepo() {
  try {
    const res = await $fetch('https://ungh.cc/repos/hugorcd/shelve') as { repo: RepoType }
    githubStars.value = res.repo.stars.toString()
  } catch (e) { /* empty */ }
}

await fetchRepo()

const columns = ref([
  {
    label: 'Product',
    children: [
      {
        label: 'Documentation',
        to: '/docs/getting-started',
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
    label: 'Company',
    children: [
      {
        label: 'About',
        to: '/about',
      },
      {
        label: 'Brand',
        to: '/brand',
      },
    ]
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

const route = useRoute()
</script>

<template>
  <UFooter :ui="{ root: 'bg-(--ui-bg) z-10', top: 'py-0 lg:py-0' }" :class="route.path === '/' ? 'bg-white dark:bg-black' : 'bg-(--ui-bg)'">
    <template #top>
      <USeparator />
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


    <template #left>
      <div class="text-xs font-mono italic tracking-tight">
        <span class="text-(--ui-text-muted)"> © {{ new Date().getFullYear() }} - Made by </span>
        <ULink to="https://hrcd.fr/">
          HugoRCD
        </ULink>
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
        <UColorModeButton />
        <div style="color-scheme: none;">
          <iframe src="https://status.shelve.cloud/badge?theme=dark" height="30" width="200" />
        </div>
      </div>
    </template>
  </UFooter>
</template>
