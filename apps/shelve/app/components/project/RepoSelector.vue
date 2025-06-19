<script setup lang="ts">
import type { GitHubRepo } from '@types'

const { repos, apps, refreshRepos, loading } = useGitHub()
const { searchTerm, filterRepos, formatRepos } = useRepoSearch()

const repo = defineModel<string>()
const fullRepo = defineModel<GitHubRepo>('fullRepo')
const open = ref(false)

function selectRepo(selectedRepo: GitHubRepo) {
  repo.value = selectedRepo.html_url
  fullRepo.value = selectedRepo
  open.value = false
}

const filteredRepos = computed(() => 
  filterRepos(repos.value || [], searchTerm.value)
)

const formattedRepos = computed(() => 
  formatRepos(filteredRepos.value, selectRepo)
)

async function openModal() {
  open.value = true
  if (!repos.value?.length) await refreshRepos()
}

const groups = computed(() => [
  {
    id: 'repos',
    label: searchTerm.value ? `Repos matching "${searchTerm.value}"` : 'Repos',
    items: formattedRepos.value,
    ignoreFilter: true
  }
])

defineSlots<{ default?: any }>()
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
        v-model:search-term="searchTerm"
        :loading
        :groups
        placeholder="Search repos..."
        class="h-80"
        :ui="{ empty: 'py-2' }"
      >
        <template #empty>
          <div v-if="loading" class="flex flex-col gap-2 p-2">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-loader-circle" class="size-4 animate-spin" />
              <p class="text-sm text-muted text-left">
                Loading repositories...
              </p>
            </div>
            <USkeleton v-for="n in 3" :key="n" class="h-6 w-full rounded-sm" />
          </div>
          <div v-else-if="searchTerm && !formattedRepos.length" class="flex flex-col items-center justify-center gap-2 py-4">
            <UIcon name="i-heroicons-magnifying-glass-slash" class="size-8 text-muted" />
            <p class="text-muted text-center">
              No repositories found for "{{ searchTerm }}"
            </p>
          </div>
          <div v-else class="flex flex-col items-center justify-center gap-2 py-4">
            <UIcon name="simple-icons:github" class="size-8" />
            <p class="text-muted">
              No repositories found.
            </p>
          </div>
        </template>
      </UCommandPalette>
    </template>
  </UModal>
</template>

