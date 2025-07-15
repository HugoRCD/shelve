<script setup lang="ts">
import type { BaseIntegration } from '@types'
import { ConfirmModal } from '#components'

interface Props {
  type: string
  name: string
  icon: string
  features: string[]
  onConnected: () => void
}

interface Integration extends BaseIntegration {
  installationId?: number // For GitHub
  configurationId?: string // For Vercel
  [key: string]: any
}

const props = defineProps<Props>()
const { emit: emitIntegrationEvent } = useIntegrationEvents()
const { 
  getIntegrations, 
  testConnection, 
  deleteIntegration, 
  getConnectionModalUrl, 
  getManagementUrl 
} = useIntegrations()

const { data: integrations, refresh } = await useFetch<Integration[]>(`/api/integrations/${props.type}`, {
  method: 'GET'
})

const isConnected = computed(() => integrations.value && integrations.value.length > 0)
const testLoading = ref(false)

async function handleTestConnection() {
  testLoading.value = true
  try {
    const result = await testConnection(props.type)
    
    if (result.connected) {
      toast.success(`${props.name} connected successfully`, {
        description: result.message,
        duration: 5000
      })
    } else {
      toast.error(`${props.name} connection failed`, {
        description: result.message
      })
    }
  } catch (error: any) {
    toast.error('Test failed', {
      description: error.message || 'Unknown error'
    })
  } finally {
    testLoading.value = false
  }
}

const overlay = useOverlay()
const modal = overlay.create(ConfirmModal)

function openRemoveModal(integration: Integration) {
  modal.open({
    title: `Remove ${props.name} Integration`,
    description: `If you remove the ${props.name} integration, you will no longer be able to sync with your ${props.name.toLowerCase()} projects.`,
    danger: true,
    async onSuccess() {
      try {
        const response = await deleteIntegration(props.type, integration)
        toast.success(response.message, {
          duration: 8000,
          action: {
            label: `Open ${props.name}`,
            onClick: () => window.open(getManagementUrl(props.type, integration), '_blank')
          }
        })
        await refresh()
        emitIntegrationEvent({ type: props.type, action: 'disconnected' })
      } catch (error: any) {
        toast.error(`Failed to remove ${props.name} integration`, {
          description: error.message
        })
      }
    },
  })
}

function handleConnect() {
  const url = getConnectionModalUrl(props.type)
  window.open(url, '_blank')
  
  const checkConnection = setInterval(async () => {
    await refresh()
    if (integrations.value && integrations.value.length > 0) {
      clearInterval(checkConnection)
      toast.success(`${props.name} integration connected successfully!`)
      emitIntegrationEvent({ type: props.type, action: 'connected' })
      props.onConnected()
    }
  }, 2000)
  
  setTimeout(() => {
    clearInterval(checkConnection)
  }, 60000)
}

function getIntegrationDisplayName(integration: Integration): string {
  if (props.type === 'vercel' && integration.configurationId) {
    return `Configuration ${integration.configurationId.substring(0, 8)}...`
  }
  if (props.type === 'github') {
    return props.name
  }
  return `${props.name} Integration`
}

function getIntegrationDisplayMeta(integration: Integration): string {
  return `Connected ${new Date(integration.createdAt).toLocaleDateString()}`
}
</script>

<template>
  <div v-if="!isConnected" class="flex flex-col text-center items-center justify-center gap-6 my-4 max-w-md mx-auto">
    <div class="space-y-2 text-left">
      <div 
        v-for="feature in features" 
        :key="feature" 
        class="flex items-center gap-2 text-sm"
      >
        <UIcon name="lucide:zap" class="size-4 text-primary flex-shrink-0" />
        <span class="text-muted">{{ feature }}</span>
      </div>
    </div>
    
    <CustomButton
      type="submit"
      size="sm"
      class="group rounded-none"
      :icon
      trailing-icon="lucide:arrow-right"
      :label="`Connect ${name}`"
      :ui="{
        label: 'mt-[1px]',
        trailingIcon: 'transition-transform group-hover:translate-x-1'
      }"
      @click="handleConnect"
    />
  </div>

  <div v-else class="space-y-4">
    <div class="bg-success/10 border border-success/20 rounded-lg p-3">
      <div class="flex items-center gap-3">
        <div class="flex-shrink-0">
          <UAvatar
            icon="i-lucide-check"
            :ui="{
              root: 'bg-success/10',
              icon: 'size-4 text-success'
            }"
          />
        </div>
        <div>
          <p class="text-sm font-medium text-highlighted">
            {{ name }} Connected
          </p>
          <p class="text-xs text-muted">
            Ready to sync with your {{ name.toLowerCase() }} projects
          </p>
        </div>
      </div>
    </div>

    <div v-if="integrations?.length" class="space-y-2">
      <h4 class="text-xs font-medium text-muted uppercase tracking-wide">
        Connected {{ integrations.length === 1 ? 'Integration' : 'Integrations' }}
      </h4>
      
      <div 
        v-for="integration in integrations" 
        :key="integration.id" 
        class="bg-muted/50 border border-default/50 rounded-lg p-3"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <UAvatar
              :icon
              :ui="{
                root: 'bg-default rounded-lg',
                icon: 'size-4 text-default'
              }"
            />
            <div>
              <p class="text-sm font-medium">
                {{ getIntegrationDisplayName(integration) }}
              </p>
              <p class="text-xs text-muted">
                {{ getIntegrationDisplayMeta(integration) }}
              </p>
            </div>
          </div>
          
          <div class="flex items-center gap-1">
            <UTooltip text="Test connection">
              <UButton
                icon="lucide:flask-conical"
                variant="ghost"
                size="xs"
                :loading="testLoading"
                @click="handleTestConnection"
              />
            </UTooltip>
             
            <UTooltip :text="`Manage on ${name}`">
              <UButton
                :to="getManagementUrl(type, integration)"
                target="_blank"
                icon="lucide:external-link"
                variant="ghost"
                size="xs"
              />
            </UTooltip>
             
            <UTooltip text="Disconnect">
              <UButton
                icon="lucide:trash-2"
                variant="ghost"
                size="xs"
                color="error"
                @click="openRemoveModal(integration)"
              />
            </UTooltip>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 
