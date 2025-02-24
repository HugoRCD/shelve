<script setup lang="ts">
const searchTerm = ref('')

const { data: apps, status: appsLoading, error } = useFetch('/api/github/apps', {
  method: 'GET'
})

const repo = defineModel({ type: String })

const open = ref(false)

function selectRepo(url: string) {
  repo.value = url
  open.value = false
}

const { data: repos, status, refresh } = useFetch('/api/github/repos', {
  params: { q: searchTerm },
  transform: (data: { id: number; name: string; html_url: string }[]) => {
    return data?.map(repo => ({ id: repo.id, label: repo.name, suffix: repo.html_url, onSelect: () => selectRepo(repo.html_url) }))
  },
  immediate: false
})

async function openModal() {
  open.value = true
  if (!repos.value) await refresh()
}

const loading = computed(() => status.value === 'pending' || appsLoading.value === 'pending')

const groups = computed(() => [
  {
    id: 'repos',
    label: searchTerm.value ? `Repos matching “${searchTerm.value}”...` : 'Repos',
    items: repos.value || [],
    ignoreFilter: true
  }
])
</script>

<template>
  <UModal v-model:open="open">
    <UTooltip v-if="apps && apps.length > 0" :content="{ side: 'top' }" text="Select Repository">
      <UButton variant="soft" icon="simple-icons:github" :loading @click="openModal" />
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
          <div v-if="!loading" class="flex flex-col items-center justify-center gap-2">
            <UIcon name="simple-icons:github" class="size-8" />
            <p class="text-pretty text-(--ui-text-muted)">
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

