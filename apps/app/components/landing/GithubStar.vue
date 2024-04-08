<script setup lang="ts">
type repoType = {
  name: string
  stars: number
  watchers: number
  forks: number
  repo: string
}

const githubStars = useCookie('githubStars')
if (!githubStars.value) {
  githubStars.value = '0'
}

async function fetchRepo() {
  try {
    const res = await $fetch('https://ungh.cc/repos/hugorcd/shelve') as { repo: repoType }
    githubStars.value = res.repo.stars.toString()
  } catch (e) { /* empty */ }
}
fetchRepo()
</script>

<template>
  <NuxtLink
    class="flex items-center gap-2 text-gray-200"
    to="https://github.com/HugoRCD/shelve"
  >
    <span class="i-custom-github text-xl" />
    <span class="text-sm font-bold">
      {{ githubStars }}
    </span>
  </NuxtLink>
</template>

<style scoped>

</style>
