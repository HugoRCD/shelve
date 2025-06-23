<script setup lang="ts">
definePageMeta({
  middleware: (to, from) => {
    const teamSlug = to.params.teamSlug || from.params.teamSlug || ''
    if (to.path === `/${teamSlug}/team`) {
      return `/${teamSlug}/team/members`
    }
  }
})

const route = useRoute()
const router = useRouter()
const teamSlug = route.params.teamSlug as string

const currentTeam = useTeam()

const items = [
  {
    label: 'Members',
    icon: 'nucleo:users',
    value: 'members'
  },
  {
    label: 'Settings',
    icon: 'nucleo:gear-2',
    value: 'settings'
  },
]

const activeTab = computed({
  get() {
    return route.path.split('/').pop() || 'members'
  },
  set(tab) {
    router.push({
      path: `/${teamSlug}/team/${tab}`
    })
  }
})

useSeoMeta({
  titleTemplate: () => `%s - ${currentTeam.value.name} Team - Shelve`
})
</script>

<template>
  <PageSection
    title="Team"
    description="Manage team members and settings"
    :image="currentTeam?.logo"
  >
    <UTabs v-model="activeTab" :items variant="link" class="w-full mb-2" />
    <NuxtPage />
  </PageSection>
</template> 
