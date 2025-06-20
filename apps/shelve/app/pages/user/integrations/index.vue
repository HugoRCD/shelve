<script setup lang="ts">
import { IntegrationModal } from '#components'

const route = useRoute()

const integrations = [
  {
    name: 'Github',
    description: 'Connect Shelve with Github to sync secrets and more...',
    icon: 'simple-icons:github'
  }
]

const { data: githubApps, refresh: refreshGithub } = await useFetch('/api/github/apps', {
  method: 'GET'
})

const isGithubConnected = computed(() => githubApps.value && githubApps.value.length > 0)

onMounted(() => {
  const integration = route.query.integration as string
  const setup = route.query.setup as string
  
  if (integration === 'github' && setup === 'success') {
    toast.success('GitHub integration connected successfully!', {
      description: 'You can now sync your environment variables with GitHub Actions',
      duration: 5000,
      action: {
        label: 'Got it',
        onClick: () => {}
      }
    })
    
    const router = useRouter()
    router.replace({ query: {} })
  }
})

const overlay = useOverlay()

function openIntegrationModal(integration: typeof integrations[0]) {
  const modal = overlay.create(IntegrationModal)
  
  modal.open({
    integration,
    onConnected() {
      refreshGithub()
      toast.success(`${integration.name} integration connected successfully!`)
    },
  })
}

function getConnectionStatus(integrationName: string) {
  switch (integrationName.toLowerCase()) {
    case 'github':
      return isGithubConnected.value
    default:
      return false
  }
}

useSeoMeta({
  title: 'Integrations',
})
</script>

<template>
  <PageSection
    title="Integrations"
    description="Connect Shelve with other services to enhance your experience."
  >
    <div class="flex flex-col gap-2">
      <div 
        v-for="integration in integrations" 
        :key="integration.name"
        class="border border-default rounded-lg hover:bg-muted transition-colors duration-200 cursor-pointer"
        @click="openIntegrationModal(integration)"
      >
        <div class="flex items-center justify-between gap-1 p-4">
          <div class="flex items-center gap-2">
            <UIcon :name="integration.icon" class="size-7" />
            <div class="flex flex-col gap-1">
              <span class="text-sm font-semibold">{{ integration.name }}</span>
              <span class="text-xs text-muted">{{ integration.description }}</span>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <UBadge 
              v-if="getConnectionStatus(integration.name)"
              variant="soft" 
              color="success" 
              label="Connected" 
            />
            <UBadge 
              v-else
              variant="soft" 
              color="neutral" 
              label="Connect" 
            />
          </div>
        </div>
      </div>
    </div>
  </PageSection>
</template>
