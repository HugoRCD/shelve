<script setup lang="ts">
import type { GitHubRepo } from '@types'

const { repos, apps, refreshRepos, query, loading } = useGitHub()

const repo = defineModel({ type: String })
const fullRepo = defineModel<GitHubRepo>('fullRepo')

const open = ref(false)

function selectRepo(url: string) {
  repo.value = url
  fullRepo.value = repos.value?.find(repo => repo.html_url === url)
  open.value = false
}

const formattedRepos = computed(() => {
  return repos.value?.map(repo => ({
    id: repo.id,
    label: repo.name,
    suffix: repo.html_url,
    onSelect: () => selectRepo(repo.html_url)
  })) || []
})

async function openModal() {
  open.value = true
  if (!repos.value || repos.value.length === 0)
    await refreshRepos()
}

const groups = computed(() => [
  {
    id: 'repos',
    label: query.value ? `Repos matching “${query.value}”...` : 'Repos',
    items: formattedRepos.value || [],
    ignoreFilter: true
  }
])

const slots = defineSlots<{
  default: any
}>()
</script>

<template>
  <UModal v-if="apps && apps.length > 0" v-model:open="open">
    <UTooltip :content="{ side: 'top' }" text="Select Repository">
      <div @click="openModal">
        <slot>
          <UButton variant="soft" icon="simple-icons:github" :loading />
        </slot>
      </div>
    </UTooltip>

    <template #content>
      <UCommandPalette
        v-model:search-term="query"
        :loading
        :groups
        placeholder="Search repos..."
        class="h-80"
        :ui="{ empty: 'py-2' }"
      >
        <template #empty>
          <div v-if="!loading" class="flex flex-col items-center justify-center gap-2">
            <UIcon name="simple-icons:github" class="size-8" />
            <p class="text-pretty text-muted">
              No repositories found.
            </p>
          </div>
          <div v-else class="flex flex-col items-center justify-center gap-2 px-2">
            <USkeleton v-for="n in 5" :key="n" class="h-6 w-full rounded-sm" />
          </div>
        </template>
      </UCommandPalette>
    </template>
  </UModal>
</template>

