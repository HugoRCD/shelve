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

onMounted(() => {
  const unsubscribe = onIntegrationEvent((data) => {
    const integrationType = props.integration.name.toLowerCase()
    if (data.type === integrationType && data.action === 'disconnected') {
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
      <IntegrationGithub 
        v-if="integration.name.toLowerCase() === 'github'"
        :on-connected 
      />
    </template>
  </UModal>
</template> 
