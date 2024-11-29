<script lang="ts" setup>
const navigation = getNavigation('home')

const items = navigation.map((item) => ({
  ...item,
  to: item.path,
  label: item.title,
  slot: item.name.toLowerCase(),
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
    <div class="fixed top-0 flex w-full">
      <div class="fixed w-full top-0 z-40 h-40 bg-gradient-to-b from-neutral-950 to-transparent" />
      <div class="z-50 flex w-full items-center justify-between sm:justify-around p-4 sm:px-5 sm:py-2">
        <NuxtLink to="/" class="flex gap-2 items-center">
          <UIcon name="custom:shelve" class="size-8" />
          <span class="font-semibold">Shelve</span>
        </NuxtLink>
        <div class="flex items-center">
          <UNavigationMenu
            :items
            color="neutral"
            class="hidden sm:flex"
            :ui="{ link: 'py-1 px-3' }"
          >
            <template #components-trailing>
              <UBadge label="44" variant="subtle" size="sm" />
            </template>
          </UNavigationMenu>
        </div>
        <div class="flex items-center gap-2">
          <div class="flex sm:hidden">
            <UDropdownMenu :items>
              <UButton color="neutral" variant="ghost" icon="lucide:menu" />
            </UDropdownMenu>
          </div>
          <div>
            <UButton
              color="neutral"
              label="Open App"
              @click="navigateTo(`https://app.shelve.cloud/login`, { external: true })"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

