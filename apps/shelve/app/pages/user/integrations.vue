<script setup lang="ts">
import { IntegrationModal } from '#components'

const route = useRoute()

const integrations = [
  {
    category: 'Secrets & Environment',
    description: 'Synchronize your environment variables and secrets',
    items: [
      {
        name: 'GitHub',
        description: 'Sync secrets with GitHub Actions and repositories',
        icon: 'simple-icons:github',
        status: 'available'
      },
      {
        name: 'Vercel',
        description: 'Sync environment variables with Vercel projects',
        icon: 'simple-icons:vercel',
        status: 'available'
      }
    ]
  },
  {
    category: 'AI & Automation',
    description: 'Connect AI services and automation tools',
    items: [
      {
        name: 'OpenAI',
        description: 'Store your OpenAI API keys for automated actions',
        icon: 'simple-icons:openai',
        status: 'soon'
      }
    ]
  }
]

const { data: githubApps, refresh: refreshGithub } = await useFetch('/api/integrations/github', {
  method: 'GET'
})

const { data: vercelIntegrations, refresh: refreshVercel } = await useFetch('/api/integrations/vercel', {
  method: 'GET'
})

const { on: onIntegrationEvent } = useIntegrationEvents()

const isGithubConnected = computed(() => githubApps.value && githubApps.value.length > 0)
const isVercelConnected = computed(() => vercelIntegrations.value && vercelIntegrations.value.length > 0)

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

  if (integration === 'vercel' && setup === 'success') {
    toast.success('Vercel integration connected successfully!', {
      description: 'You can now sync your environment variables with Vercel projects',
      duration: 5000,
      action: {
        label: 'Got it',
        onClick: () => {}
      }
    })
    
    const router = useRouter()
    router.replace({ query: {} })
  }

  const unsubscribe = onIntegrationEvent((data) => {
    if (data.type === 'github') {
      refreshGithub()
    }
    if (data.type === 'vercel') {
      refreshVercel()
    }
  })

  onUnmounted(() => {
    unsubscribe()
  })
})

const overlay = useOverlay()

function openIntegrationModal(integration: any) {
  if (integration.status === 'soon') {
    toast.info(`${integration.name} integration coming soon!`, {
      description: 'This integration is currently in development'
    })
    return
  }

  const modal = overlay.create(IntegrationModal)
  
  modal.open({
    integration,
    onConnected() {},
  })
}

function getConnectionStatus(integrationName: string) {
  switch (integrationName.toLowerCase()) {
    case 'github':
      return isGithubConnected.value
    case 'vercel':
      return isVercelConnected.value
    default:
      return false
  }
}

function getStatusBadge(integration: any) {
  if (integration.status === 'soon') {
    return { variant: 'soft' as const, color: 'neutral' as const, label: 'Soon' }
  }
  
  if (getConnectionStatus(integration.name)) {
    return { variant: 'soft' as const, color: 'success' as const, label: 'Connected' }
  }
  
  return { variant: 'soft' as const, color: 'primary' as const, label: 'Connect' }
}

useSeoMeta({
  title: 'Integrations',
})
</script>

<template>
  <PageSection
    title="Integrations"
    description="Connect Shelve to other tools that your team uses"
  >
    <div class="space-y-12">
      <div 
        v-for="category in integrations" 
        :key="category.category"
        class="space-y-4"
      >
        <div>
          <h3 class="text-sm font-medium text-muted uppercase tracking-wider">
            {{ category.category }}
          </h3>
          <p class="text-xs text-muted/80 mt-1">
            {{ category.description }}
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="integration in category.items"
            :key="integration.name"
            class="relative border border-default hover:bg-muted/30 transition-all duration-200 group"
            :class="{
              'cursor-pointer': integration.status !== 'soon',
              'cursor-default opacity-50': integration.status === 'soon'
            }"
            @click="openIntegrationModal(integration)"
          >
            <div class="p-4">
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                  <UAvatar
                    :icon="integration.icon"
                    class="bg-muted/50 rounded-none"
                    :ui="{
                      icon: 'text-highlighted'
                    }"
                  />
                  <div>
                    <h4 class="font-semibold">
                      {{ integration.name }}
                    </h4>
                  </div>
                </div>
                <UBadge 
                  v-bind="getStatusBadge(integration)"
                />
              </div>
              
              <p class="text-sm text-muted leading-relaxed">
                {{ integration.description }}
              </p>
            </div>
            
            <div 
              v-if="getConnectionStatus(integration.name)"
              class="absolute top-2 right-2"
            >
              <UIcon name="heroicons:check-circle" class="size-4 text-success" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </PageSection>
</template>
