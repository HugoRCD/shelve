<script setup lang="ts">
interface IntegrationModalProps {
  integration: {
    name: string
    description: string
    icon: string
  }
}

const props = defineProps<IntegrationModalProps>()

const emit = defineEmits<{ 
  close: [boolean]
  connected: [void] 
}>()

const { on: onIntegrationEvent } = useIntegrationEvents()

function onConnected() {
  emit('connected')
  emit('close', false)
}

function onClose() {
  emit('close', false)
}

const integrationConfigs = {
  github: {
    features: [
      'Automatically sync secrets to GitHub',
      'Secure repository access management',
      'Keep CI/CD pipelines up to date'
    ]
  },
  vercel: {
    features: [
      'Automatically sync environment variables to Vercel',
      'Deploy with up-to-date configurations',
      'Keep projects synchronized'
    ]
  }
}

const integrationType = computed(() => props.integration.name.toLowerCase())
const integrationConfig = computed(() => integrationConfigs[integrationType.value as keyof typeof integrationConfigs])

onMounted(() => {
  const unsubscribe = onIntegrationEvent((data) => {
    if (data.type === integrationType.value && data.action === 'disconnected') {
      emit('close', false)
    }
  })

  onUnmounted(() => {
    unsubscribe()
  })
})
</script>

<template>
  <UModal
    :close="{ onClick: onClose }"
    :ui="{
      overlay: 'bg-default/10 backdrop-blur-sm',
      header: '!p-4',
      body: '!p-4'
    }"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div class="bg-elevated p-2 rounded-lg flex items-center justify-center border border-default">
          <UIcon :name="integration.icon" class="size-5" />
        </div>
        <div>
          <h3 class="font-semibold">
            Connect {{ integration.name }}
          </h3>
          <p class="text-sm text-muted">
            {{ integration.description }}
          </p>
        </div>
      </div>
    </template>

    <template #body>
      <IntegrationBase
        v-if="integrationConfig"
        :type="integrationType"
        :name="integration.name"
        :icon="integration.icon"
        :features="integrationConfig.features"
        :on-connected
      />
      
      <div v-else>
        <IntegrationGithub 
          v-if="integrationType === 'github'"
          :on-connected 
        />
        <IntegrationVercel 
          v-if="integrationType === 'vercel'"
          :on-connected 
        />
      </div>
    </template>
  </UModal>
</template> 
