<script lang="ts" setup>
const navigation = getNavigation('home')

const items = navigation.map((item) => ({
  ...item,
  to: item.path,
  label: item.title,
  slot: item.name.toLowerCase(),
}))

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
        <div class="flex items-center gap-4">
          <NuxtLink to="/" class="font-newsreader text-2xl font-light italic">
            Shelve
          </NuxtLink>
          <UNavigationMenu :items color="neutral" class="hidden sm:flex" :ui="{ link: 'text-white' }">
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
              variant="soft"
              color="neutral"
              label="Login"
              @click="navigateTo(`https://app.shelve.cloud/login`, { external: true })"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

