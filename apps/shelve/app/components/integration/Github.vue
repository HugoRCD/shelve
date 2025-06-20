<script setup lang="ts">
import { ConfirmModal } from '#components'

interface Props {
  onConnected: () => void
}

const props = defineProps<Props>()

const { data: apps, refresh } = await useFetch('/api/github/apps', {
  method: 'GET'
})

const config = useRuntimeConfig()
const { appName } = config.public.github

const isConnected = computed(() => apps.value && apps.value.length > 0)

const overlay = useOverlay()
const modal = overlay.create(ConfirmModal)

function openRemoveModal(installationId: string) {
  modal.open({
    title: 'Remove GitHub Integration',
    description: `If you remove the GitHub integration, you will no longer be able to sync secrets with your repositories.`,
    danger: true,
    async onSuccess() {
      const response = await $fetch<{
        message: string
        link: string
      }>(`/api/github/apps/${installationId}`, {
        method: 'DELETE'
      })
      toast.success(response.message, {
        duration: 10000,
        action: {
          label: 'Open Github',
          onClick: () => window.open(response.link, '_blank')
        }
      })
      await refresh()
    },
  })
}

function handleConnect() {
  window.open(`https://github.com/apps/${appName}/installations/new`, '_blank')
  
  const checkConnection = setInterval(async () => {
    await refresh()
    if (apps.value && apps.value.length > 0) {
      clearInterval(checkConnection)
      toast.success('GitHub integration connected successfully!')
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
        <span class="text-muted">Automatically sync secrets to GitHub</span>
      </div>
      <div class="flex items-center gap-2 text-sm">
        <UIcon name="lucide:shield-check" class="size-4 text-primary flex-shrink-0" />
        <span class="text-muted">Secure repository access management</span>
      </div>
      <div class="flex items-center gap-2 text-sm">
        <UIcon name="lucide:refresh-cw" class="size-4 text-primary flex-shrink-0" />
        <span class="text-muted">Keep CI/CD pipelines up to date</span>
      </div>
    </div>
    
    <CustomButton
      type="submit"
      size="sm"
      class="group rounded-none"
      icon="simple-icons:github"
      trailing-icon="lucide:arrow-right"
      label="Connect GitHub"
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
            GitHub Connected
          </p>
          <p class="text-xs text-muted">
            Ready to sync secrets with your repositories
          </p>
        </div>
      </div>
    </div>

    <div v-if="apps?.length" class="space-y-2">
      <h4 class="text-xs font-medium text-muted uppercase tracking-wide">
        Connected App
      </h4>
      
      <div v-for="app in apps" :key="app.id" class="bg-muted/50 border border-default/50 rounded-lg p-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <UAvatar
              icon="simple-icons:github"
              :ui="{
                root: 'bg-default rounded-lg',
                icon: 'size-4 text-default'
              }"
            />
            <div>
              <p class="text-sm font-medium">
                {{ appName }}
              </p>
              <p class="text-xs text-muted">
                GitHub Application
              </p>
            </div>
          </div>
          
          <div class="flex items-center gap-1">
            <UTooltip text="Manage repositories">
              <UButton
                :to="`https://github.com/apps/${appName}/installations/new`"
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
                @click="openRemoveModal(app.installationId)"
              />
            </UTooltip>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 
