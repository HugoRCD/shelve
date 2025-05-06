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

const links = [
  {
    label: 'llms.txt',
    to: 'https://shelve.cloud/llms.txt',
  }, {
    label: 'Roadmap',
    to: '/roadmap'
  }, {
    label: 'Releases',
    to: 'https://github.com/hugorcd/shelve/releases',
    target: '_blank'
  }
]

const route = useRoute()
</script>

<template>
  <USeparator icon="custom:shelve" class="h-px z-20" />
  <UFooter :ui="{ root: 'bg-default z-10' }">
    <template #left>
      <div class="text-xs font-mono italic tracking-tight">
        <span class="text-muted"> © {{ new Date().getFullYear() }} - Made by </span>
        <ULink to="https://hrcd.fr/">
          HugoRCD
        </ULink>
      </div>
    </template>

    <UNavigationMenu :items="links" variant="link" color="neutral" />

    <template #right>
      <div class="flex items-center gap-2">
        <UButton
          icon="i-simple-icons-x"
          color="neutral"
          variant="ghost"
          to="https://x.com/shelvecloud"
          target="_blank"
          aria-label="X"
          size="sm"
        />
        <UButton
          icon="i-simple-icons-github"
          color="neutral"
          variant="ghost"
          to="https://github.com/hugorcd/shelve"
          target="_blank"
          aria-label="GitHub"
          size="sm"
        />
        <UColorModeButton size="sm" />
        <div style="color-scheme: none;">
          <iframe src="https://status.shelve.cloud/badge?theme=dark" height="30" width="200" />
        </div>
      </div>
    </template>
  </UFooter>
</template>
