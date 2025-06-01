<script setup lang="ts">
import { ConfirmModal } from '#components'

definePageMeta({
  title: 'Github Integration',
  icon: 'simple-icons:github',
  name: 'Integrations'
})

const { data: apps, status, refresh } = await useFetch('/api/github/apps', {
  method: 'GET'
})

const config = useRuntimeConfig()
const { appName } = config.public.github

const overlay = useOverlay()
const modal = overlay.create(ConfirmModal)

function openRemoveModal(installationId: string) {
  modal.open({
    title: 'Remove Repository Access',
    description: `You are about to remove access to your github repository. You can reinstall the app later if needed.`,
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
</script>

<template>
  <PageSection
    title="Your Github Apps"
    description="Github Apps are used to sync secrets and more..."
  >
    <div v-if="status !== 'pending' && apps?.length" class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div
        v-for="app in apps"
        :key="app.id"
        class="group relative overflow-hidden bg-muted border border-default rounded-lg hover:shadow-lg transition-all duration-300"
      >
        <div class="absolute top-0 right-0 p-2">
          <UButton
            icon="lucide:trash"
            variant="ghost"
            size="xs"
            class="opacity-0 group-hover:opacity-100 transition-opacity"
            color="error"
            @click="openRemoveModal(app.installationId)"
          />
        </div>

        <div class="p-2">
          <div class="flex items-center gap-2 mb-3">
            <div class="bg-elevated p-2 rounded-full flex items-center justify-center border border-default">
              <UIcon name="simple-icons:github" class="size-5" />
            </div>
            <div class="flex flex-col">
              <h3 class="font-semibold">
                {{ appName }}
              </h3>
              <span class="text-xs text-muted">GitHub App</span>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <NuxtLink
              :to="`https://github.com/apps/${appName}/installations/new`"
              target="_blank"
              class="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-elevated transition-colors"
            >
              <UIcon name="lucide:folder" class="size-4" />
              <span class="text-xs">Manage repositories</span>
              <UIcon name="lucide:external-link" class="size-3 ml-auto" />
            </NuxtLink>
          </div>
        </div>

        <div class="p-2 bg-elevated/50 border-t border-default">
          <div class="flex items-center text-xs text-muted">
            <UIcon name="lucide:info" class="size-4 mr-2" />
            Click to manage app settings
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="status === 'pending'" class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <USkeleton v-for="i in 4" :key="i" class="h-32" />
    </div>
    <div
      v-else
      class="flex flex-col items-center justify-center p-8 bg-elevated/20 border border-default rounded-lg"
    >
      <div class="relative mb-6">
        <div class="flex items-center justify-center relative p-6 bg-elevated rounded-full border border-default">
          <UIcon name="simple-icons:github" class="size-12 text-muted" />
        </div>

        <div class="absolute -top-2 -right-2 size-4 bg-elevated rounded-full" />
        <div class="absolute -bottom-1 -left-3 size-3 bg-elevated rounded-full" style="animation-delay: 0.2s" />
      </div>

      <div class="text-center max-w-sm">
        <h2 class="text-lg font-semibold mb-2">
          No Github Apps Yet
        </h2>
        <p class="text-sm text-muted mb-6">
          Create a GitHub App to start managing your repositories and synchronizing secrets across your environments.
        </p>

        <div class="flex justify-center">
          <CustomButton
            type="submit"
            size="sm"
            :to="`https://github.com/apps/${appName}/installations/new`"
            class="group rounded-none"
            icon="simple-icons:github"
            trailing-icon="lucide:arrow-right"
            label="Create Your First GitHub App"
            :ui="{
              label: 'mt-[1px]',
              trailingIcon: 'transition-transform group-hover:translate-x-1'
            }"
          />
        </div>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-4 w-full max-w-md">
        <div class="flex items-start gap-2 p-3 bg-elevated">
          <UIcon name="lucide:key" class="size-5 mt-0.5" />
          <div class="flex flex-col text-xs">
            <span class="font-medium">Secure Secrets</span>
            <span class="text-muted">Sync across environments</span>
          </div>
        </div>
        <div class="flex items-start gap-2 p-3 bg-elevated">
          <UIcon name="lucide:git-branch" class="size-5 mt-0.5" />
          <div class="flex flex-col text-xs">
            <span class="font-medium">Repository Access</span>
            <span class="text-muted">Manage permissions</span>
          </div>
        </div>
      </div>
    </div>

    <template #actions>
      <!--      <UButton
          icon="lucide:code-xml"
          label="Documentation"
          to="https://shelve.cloud/docs/integrations/github"
          size="xs"
          variant="subtle"
          class="max-md:hidden rounded-none"
        />-->
      <CustomButton
        icon="simple-icons:github"
        label="Install GitHub App"
        size="xs"
        :to="`https://github.com/apps/${appName}/installations/new`"
        target="_blank"
        :ui="{ label: 'mt-[1px]' }"
      />
    </template>
  </PageSection>
</template>
