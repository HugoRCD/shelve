<script lang="ts" setup>
const navigation = getNavigation('home')

const props = defineProps<{
  /*
   * The scroll % of the navbar
   */
  scroll: number
}>()

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
  target: '_blank',
  class: '@min-[620px]:flex'
}

items.push(githubItem)

const headerUi = computed(() => ({
  root: [
    '@container fixed mt-2 px-0 rounded-xl py-2 transition-all duration-500 left-1/2 -translate-x-1/2',
    props.scroll > 0.02 ? 'bg-neutral-950/50 backdrop-blur-lg' : 'bg-transparent backdrop-blur-none',
    props.scroll > 0.02 ? 'border' : 'border-transparent',
    props.scroll > 0.005 ? '[--header-width:90%] sm:[--header-width:60%]' : '[--header-width:100%]',
    'w-[var(--header-width)]'
  ] as never as string,
  container: 'h-fit',
  center: '@min-[620px]:flex',
  toggle: '@min-[620px]:hidden',
  body: 'py-0'
}))
</script>

<template>
  <div class="z-[99] flex justify-center">
    <Blur position="both" />
    <UHeader mode="drawer" :ui="headerUi">
      <template #left>
        <Logo />
      </template>

      <UNavigationMenu variant="link" color="neutral" :items :ui="{ item: 'py-0' }">
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
