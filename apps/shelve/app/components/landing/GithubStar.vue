<script setup lang="ts">
type RepoType = {
  name: string
  stars: number
  watchers: number
  forks: number
  repo: string
}

const githubStars = ref('0')

async function fetchRepo() {
  try {
    const res = await $fetch('https://ungh.cc/repos/hugorcd/shelve') as { repo: RepoType }
    githubStars.value = res.repo.stars.toString()
  } catch (e) { /* empty */ }
}

await fetchRepo()
</script>

<template>
  <NuxtLink
    class="flex items-center gap-2 text-neutral-200"
    to="https://github.com/HugoRCD/shelve"
  >
    <UIcon name="custom:github" class="fill-white text-xl" />
    <span class="text-sm font-bold">
      {{ githubStars }}
    </span>
  </NuxtLink>
</template>
