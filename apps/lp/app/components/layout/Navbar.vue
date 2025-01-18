<script lang="ts" setup>
const navigation = getNavigation('home')

const items = navigation.map((item) => ({
  ...item,
  to: item.path,
  label: item.title,
  slot: item.name.toLowerCase(),
  target: item.path.startsWith('http') ? '_blank' : undefined
}))

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

const githubItem = {
  label: 'GitHub',
  icon: 'i-simple-icons-github',
  badge: githubStars.value,
  to: 'https://github.com/HugoRCD/shelve',
  target: '_blank'
}

items.push(githubItem)
</script>

<template>
  <div class="z-[99] relative">
    <Blur position="both" />
    <UHeader class="fixed w-full p-4 px-5 py-2 bg-transparent backdrop-blur-none border-none" mode="drawer">
      <template #left>
        <Logo />
      </template>

      <UNavigationMenu color="neutral" :items>
        <template #components-trailing>
          <UBadge variant="subtle" size="sm" />
        </template>
      </UNavigationMenu>

      <template #right>
        <div class="flex items-center gap-2">
          <div>
            <UButton label="Open App" size="sm" @click="navigateTo(`https://app.shelve.cloud/login`, { external: true })" />
          </div>
        </div>
      </template>

      <template #content>
        <UNavigationMenu :items orientation="vertical" class="-mx-2.5" />
      </template>
    </UHeader>
  </div>
</template>

