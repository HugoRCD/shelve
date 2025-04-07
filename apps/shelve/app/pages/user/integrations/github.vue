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
const { githubAppName } = config.public

const overlay = useOverlay()
const modal = overlay.create(ConfirmModal)

function openRemoveModal(installationId: number, repoName: string) {
  modal.open({
    title: 'Remove Repository Access',
    description: `You are about to remove access to ${repoName}. You can reinstall the app later if needed.`,
    danger: true,
    async onSuccess() {
      const response = await $fetch(`/api/github/apps/${installationId}`, {
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
    title="GitHub Integration"
    description="Connect your GitHub repositories to enable advanced features and synchronize secrets."
    :stagger="1"
  >
    <!-- Installations existantes -->
    <div v-if="status !== 'pending' && apps?.length" class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div
        v-for="installation in apps"
        :key="installation.id"
        class="group relative overflow-hidden bg-(--ui-bg-muted) border border-(--ui-border) rounded-lg hover:shadow-lg transition-all duration-300"
      >
        <div class="absolute top-0 right-0 p-2">
          <UButton
            icon="lucide:trash"
            variant="ghost"
            size="xs"
            class="opacity-0 group-hover:opacity-100 transition-opacity"
            color="error"
            @click="openRemoveModal(installation.id, installation.account.login)"
          />
        </div>

        <div class="p-4">
          <div class="flex items-center gap-3 mb-3">
            <img :src="installation.account.avatar_url" class="size-10 rounded-full" alt="Repository avatar">
            <div class="flex flex-col">
              <h3 class="font-semibold">
                {{ installation.account.login }}
              </h3>
              <span class="text-xs text-(--ui-text-muted)">
                {{ installation.repositories_count }} repositories
              </span>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <NuxtLink
              :to="`https://github.com/apps/${githubAppName}/installations/${installation.id}`"
              target="_blank"
              class="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-(--ui-bg-elevated) transition-colors"
            >
              <UIcon name="lucide:settings" class="size-4" />
              <span class="text-xs">Configure installation</span>
              <UIcon name="lucide:external-link" class="size-3 ml-auto" />
            </NuxtLink>

            <NuxtLink
              :to="`/user/integrations/github/repos?installation=${installation.id}`"
              class="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-(--ui-bg-elevated) transition-colors"
            >
              <UIcon name="lucide:folder" class="size-4" />
              <span class="text-xs">Manage repositories</span>
              <UIcon name="lucide:chevron-right" class="size-3 ml-auto" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="status === 'pending'" class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <USkeleton v-for="i in 2" :key="i" class="h-40" />
    </div>

    <div
      v-else
      class="flex flex-col items-center justify-center p-8 bg-(--ui-bg-elevated)/20 border border-(--ui-border) rounded-lg"
    >
      <div class="relative mb-6">
        <div class="flex items-center justify-center relative p-6 bg-(--ui-bg-elevated) rounded-full border border-(--ui-border)">
          <UIcon name="simple-icons:github" class="size-12 text-(--ui-text-muted)" />
        </div>
        <div class="absolute -top-2 -right-2 size-4 bg-(--ui-bg-elevated) rounded-full" />
        <div class="absolute -bottom-1 -left-3 size-3 bg-(--ui-bg-elevated) rounded-full" style="animation-delay: 0.2s" />
      </div>

      <div class="text-center max-w-sm">
        <h2 class="text-lg font-semibold mb-2">
          Connect to GitHub
        </h2>
        <p class="text-sm text-(--ui-text-muted) mb-6">
          Install our GitHub App to start managing your repositories and synchronizing secrets across your environments.
        </p>

        <div class="flex justify-center">
          <CustomButton
            type="submit"
            size="sm"
            :to="`https://github.com/apps/${githubAppName}/installations/new`"
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

      <div class="mt-8 grid grid-cols-2 gap-4 w-full max-w-md">
        <div class="flex items-start gap-2 p-3 bg-(--ui-bg-elevated)">
          <UIcon name="lucide:key" class="size-5 mt-0.5" />
          <div class="flex flex-col text-xs">
            <span class="font-medium">Secure Secrets</span>
            <span class="text-(--ui-text-muted)">Sync across environments</span>
          </div>
        </div>
        <div class="flex items-start gap-2 p-3 bg-(--ui-bg-elevated)">
          <UIcon name="lucide:git-branch" class="size-5 mt-0.5" />
          <div class="flex flex-col text-xs">
            <span class="font-medium">Repository Access</span>
            <span class="text-(--ui-text-muted)">Manage permissions</span>
          </div>
        </div>
      </div>
    </div>

    <template #actions>
      <div class="flex items-center gap-2">
        <UButton
          icon="lucide:code-xml"
          label="Documentation"
          to="https://shelve.cloud/docs/integrations/github"
          size="xs"
          variant="subtle"
          class="max-md:hidden rounded-none"
        />
        <CustomButton
          icon="simple-icons:github"
          label="Install GitHub App"
          size="xs"
          :to="`https://github.com/apps/${githubAppName}/installations/new`"
          target="_blank"
          :ui="{ label: 'mt-[1px]' }"
        />
      </div>
    </template>
  </PageSection>
</template>
