<script setup lang="ts">
import type { Environment } from '@shelve/types'
import { getRandomGithubAppName } from '~~/server/utils/random'
import { ConfirmModal } from '#components'

definePageMeta({
  title: 'Github Integration',
  icon: 'simple-icons:github',
  name: 'Integrations'
})

const { data, status, refresh } = await useFetch('/api/github/apps', {
  method: 'GET'
})

const appUrl = window.location.origin

const manifest = {
  name: getRandomGithubAppName(),
  url: appUrl,
  hook_attributes: {
    url: `${appUrl}/api/githook`
  },
  redirect_url: `${appUrl}/callback/github`,
  callback_urls: [`${appUrl}/callback/github`],
  setup_url: `${ appUrl }/user/integrations/github`,
  description: 'Shelve GitHub App',
  public: false,
  default_permissions: {
    issues: 'write',
    pull_requests: 'write',
    contents: 'write',
    metadata: 'read',
    secrets: 'write',
  }
}

const modal = useModal()
function openDeleteModal(slug: string) {
  modal.open(ConfirmModal, {
    title: 'Delete Github App',
    description: `You are about to delete ${slug}. This action cannot be undone.`,
    danger: true,
    async onSuccess() {
      const response = await $fetch(`/api/github/apps/${slug}`, {
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
  <div class="flex flex-col gap-4 pb-4">
    <Teleport defer to="#action-items">
      <form action="https://github.com/settings/apps/new" method="post">
        <input id="manifest" type="text" name="manifest" class="hidden" :value="JSON.stringify(manifest)">
        <UButton icon="simple-icons:github" label="Create GitHub App" size="xs" type="submit" />
      </form>
    </Teleport>
    <div style="--stagger: 1" data-animate class="flex flex-col gap-3">
      <div class="flex flex-col gap-1">
        <h2 class="text-lg font-bold flex items-center gap-2">
          Your Github Apps
        </h2>
        <p class="text-sm text-neutral-500">
          Github Apps are used to sync secrets and more...
        </p>
      </div>
      <USeparator class="mb-3" />
      <div v-if="status !== 'pending'" class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div
          v-for="app in data"
          :key="app.id"
          class="group relative overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:shadow-lg transition-all duration-300"
        >
          <!-- Card Header -->
          <div class="absolute top-0 right-0 p-2">
            <UButton
              icon="lucide:trash"
              variant="ghost"
              size="xs"
              class="opacity-0 group-hover:opacity-100 transition-opacity"
              color="error"
              @click="openDeleteModal(app.slug)"
            />
          </div>

          <div class="p-2">
            <div class="flex items-center gap-2 mb-3">
              <div class="bg-neutral-50 dark:bg-neutral-800 p-2 rounded-full flex items-center justify-center border border-neutral-200 dark:border-neutral-700">
                <UIcon name="simple-icons:github" class="size-5 text-white" />
              </div>
              <div class="flex flex-col">
                <h3 class="font-semibold">
                  {{ app.slug }}
                </h3>
                <span class="text-xs text-neutral-500">GitHub App</span>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <NuxtLink
                :to="`https://github.com/apps/${app.slug}/installations/new`"
                target="_blank"
                class="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <UIcon name="lucide:folder" class="size-4" />
                <span class="text-xs">Manage repositories</span>
                <UIcon name="lucide:external-link" class="size-3 ml-auto" />
              </NuxtLink>

              <NuxtLink
                :to="`https://github.com/settings/apps/${app.slug}/permissions`"
                target="_blank"
                class="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <UIcon name="lucide:shield" class="size-4" />
                <span class="text-xs">Permissions</span>
                <UIcon name="lucide:external-link" class="size-3 ml-auto" />
              </NuxtLink>
            </div>
          </div>

          <div class="p-2 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-800">
            <div class="flex items-center text-xs text-neutral-500">
              <UIcon name="lucide:info" class="size-4 mr-2" />
              Click to manage app settings
            </div>
          </div>
        </div>
      </div>
      <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <USkeleton v-for="i in 4" :key="i" class="h-32" />
      </div>
      <div v-if="status !== 'pending' && data" class="flex h-64 flex-col items-center justify-center gap-4">
        <div v-if="data.length === 0" class="flex h-64 flex-col items-center justify-center gap-4">
          <UIcon name="heroicons:folder-open" class="size-10 text-neutral-400" />
          <h2 class="text-lg font-semibold">
            No Github Apps found
          </h2>
          <p class="text-sm text-neutral-500">
            You don't have any Github Apps yet. Create one now!
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
