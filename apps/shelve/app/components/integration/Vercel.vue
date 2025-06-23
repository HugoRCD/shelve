<script setup lang="ts">
import { ConfirmModal } from '#components'

interface Props {
  onConnected: () => void
}

interface VercelIntegration {
  id: number
  configurationId: string
  userId: number
  createdAt: string
  updatedAt: string
}

const props = defineProps<Props>()
const { emit: emitIntegrationEvent } = useIntegrationEvents()

const { data: integrations, refresh } = await useFetch<VercelIntegration[]>('/api/vercel/integrations', {
  method: 'GET'
})

const config = useRuntimeConfig()
const isConnected = computed(() => integrations.value && integrations.value.length > 0)

const testLoading = ref(false)

async function testConnection() {
  testLoading.value = true
  try {
    const result = await $fetch('/api/vercel/test')
    console.log('🚀 Vercel Test Result:', result)
    
    if (result.connected) {
      toast.success(`Vercel connected as ${result.user?.username || 'Unknown'}`, {
        description: result.message,
        duration: 5000
      })
    } else {
      toast.error('Vercel connection failed', {
        description: result.message
      })
    }
  } catch (error: any) {
    console.error('❌ Vercel Test Error:', error)
    toast.error('Test failed', {
      description: error.message || 'Unknown error'
    })
  } finally {
    testLoading.value = false
  }
}

const overlay = useOverlay()
const modal = overlay.create(ConfirmModal)

function openRemoveModal(configurationId: string) {
  modal.open({
    title: 'Remove Vercel Integration',
    description: `If you remove the Vercel integration, you will no longer be able to sync environment variables with your Vercel projects.`,
    danger: true,
    async onSuccess() {
      const response = await $fetch<{
        message: string
      }>(`/api/vercel/integrations/${configurationId}`, {
        method: 'DELETE'
      })
      toast.success(response.message, {
        duration: 8000,
        action: {
          label: 'Open Vercel',
          onClick: () => window.open('https://vercel.com/dashboard/integrations', '_blank')
        }
      })
      await refresh()
      emitIntegrationEvent({ type: 'vercel', action: 'disconnected' })
    },
  })
}

function handleConnect() {
  const currentHost = window.location.origin
  const redirectUri = `${currentHost}/api/vercel/integrations/callback`
  const vercelUrl = `https://vercel.com/integrations/shelve/new?redirect_uri=${encodeURIComponent(redirectUri)}`
  
  window.open(vercelUrl, '_blank')
  
  const checkConnection = setInterval(async () => {
    await refresh()
    if (integrations.value && integrations.value.length > 0) {
      clearInterval(checkConnection)
      toast.success('Vercel integration connected successfully!')
      emitIntegrationEvent({ type: 'vercel', action: 'connected' })
      props.onConnected()
    }
  }, 2000)
  
  setTimeout(() => {
    clearInterval(checkConnection)
  }, 60000)
}
</script>

<template>
  <div v-if="!isConnected" class="flex flex-col text-center items-center justify-center gap-6 my-4 max-w-md mx-auto">
    <div class="space-y-2 text-left">
      <div class="flex items-center gap-2 text-sm">
        <UIcon name="lucide:zap" class="size-4 text-primary flex-shrink-0" />
        <span class="text-muted">Automatically sync environment variables to Vercel</span>
      </div>
      <div class="flex items-center gap-2 text-sm">
        <UIcon name="lucide:cloud" class="size-4 text-primary flex-shrink-0" />
        <span class="text-muted">Deploy with up-to-date configurations</span>
      </div>
      <div class="flex items-center gap-2 text-sm">
        <UIcon name="lucide:refresh-cw" class="size-4 text-primary flex-shrink-0" />
        <span class="text-muted">Keep projects synchronized</span>
      </div>
    </div>
    
    <CustomButton
      type="submit"
      size="sm"
      class="group rounded-none"
      icon="simple-icons:vercel"
      trailing-icon="lucide:arrow-right"
      label="Connect Vercel"
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
            Vercel Connected
          </p>
          <p class="text-xs text-muted">
            Ready to sync environment variables with your projects
          </p>
        </div>
      </div>
    </div>

    <div v-if="integrations?.length" class="space-y-2">
      <h4 class="text-xs font-medium text-muted uppercase tracking-wide">
        Connected Integrations
      </h4>
      
      <div v-for="integration in integrations" :key="integration.id" class="bg-muted/50 border border-default/50 rounded-lg p-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <UAvatar
              icon="simple-icons:vercel"
              :ui="{
                root: 'bg-default rounded-lg',
                icon: 'size-4 text-default'
              }"
            />
            <div>
              <p class="text-sm font-medium">
                Configuration {{ integration.configurationId.substring(0, 8) }}...
              </p>
              <p class="text-xs text-muted">
                Connected {{ new Date(integration.createdAt).toLocaleDateString() }}
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
                @click="testConnection"
              />
            </UTooltip>
             
            <UTooltip text="Manage on Vercel">
              <UButton
                to="https://vercel.com/dashboard/integrations"
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
                @click="openRemoveModal(integration.configurationId)"
              />
            </UTooltip>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 
