<script setup lang="ts">
import { getRandomGithubAppName } from '~~/server/utils/random'
import { ConfirmModal } from '#components'

definePageMeta({
  title: 'Github Integration',
  icon: 'simple-icons:github',
  name: 'Integrations'
})

const { data: apps, status, refresh } = await useFetch('/api/github/apps', {
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
    administration: 'write',
    contents: 'write',
    metadata: 'read',
    secrets: 'write',
  }
}

const overlay = useOverlay()
const modal = overlay.create(ConfirmModal)

function openDeleteModal(slug: string) {
  modal.open({
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
      <form action="https://github.com/settings/apps/new" method="post" class="flex items-center gap-2">
        <input id="manifest" type="text" name="manifest" class="hidden" :value="JSON.stringify(manifest)">
        <UButton icon="simple-icons:github" label="Create GitHub App" size="xs" type="submit" class="rounded-none" />
        <UButton
          icon="lucide:code-xml"
          label="Documentation"
          to="https://shelve.cloud/docs/integrations/github"
          size="xs"
          variant="subtle"
          class="max-md:hidden rounded-none"
        />
      </form>
    </Teleport>
    <div style="--stagger: 1" data-animate class="flex flex-col gap-3">
      <LayoutSectionHeader title="Your Github Apps" description="Github Apps are used to sync secrets and more..." />
      <USeparator class="mb-3" />
      <div v-if="status !== 'pending'" class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div
          v-for="app in apps"
          :key="app.id"
          class="group relative overflow-hidden bg-(--ui-bg-muted) border border-(--ui-border) rounded-lg hover:shadow-lg transition-all duration-300"
        >
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
              <div class="bg-(--ui-bg-elevated) p-2 rounded-full flex items-center justify-center border border-(--ui-border)">
                <UIcon name="simple-icons:github" class="size-5" />
              </div>
              <div class="flex flex-col">
                <h3 class="font-semibold">
                  {{ app.slug }}
                </h3>
                <span class="text-xs text-(--ui-text-muted)">GitHub App</span>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <NuxtLink
                :to="`https://github.com/apps/${app.slug}/installations/new`"
                target="_blank"
                class="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-(--ui-bg-elevated) transition-colors"
              >
                <UIcon name="lucide:folder" class="size-4" />
                <span class="text-xs">Manage repositories</span>
                <UIcon name="lucide:external-link" class="size-3 ml-auto" />
              </NuxtLink>

              <NuxtLink
                :to="`https://github.com/settings/apps/${app.slug}/permissions`"
                target="_blank"
                class="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-(--ui-bg-elevated) transition-colors"
              >
                <UIcon name="lucide:shield" class="size-4" />
                <span class="text-xs">Permissions</span>
                <UIcon name="lucide:external-link" class="size-3 ml-auto" />
              </NuxtLink>
            </div>
          </div>

          <div class="p-2 bg-(--ui-bg-elevated)/50 border-t border-(--ui-border)">
            <div class="flex items-center text-xs text-(--ui-text-muted)">
              <UIcon name="lucide:info" class="size-4 mr-2" />
              Click to manage app settings
            </div>
          </div>
        </div>
      </div>
      <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <USkeleton v-for="i in 4" :key="i" class="h-32" />
      </div>
      <div
        v-if="status !== 'pending' && apps?.length === 0"
        class="flex flex-col items-center justify-center p-8 bg-(--ui-bg-elevated)/20 border border-(--ui-border)"
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
            No Github Apps Yet
          </h2>
          <p class="text-sm text-(--ui-text-muted) mb-6">
            Create a GitHub App to start managing your repositories and synchronizing secrets across your environments.
          </p>

          <form action="https://github.com/settings/apps/new" method="post" class="inline-block">
            <input id="manifest-empty" type="text" name="manifest" class="hidden" :value="JSON.stringify(manifest)">
            <UButton
              type="submit"
              size="sm"
              class="group rounded-none"
            >
              <template #leading>
                <UIcon name="simple-icons:github" class="size-4" />
              </template>
              Create Your First GitHub App
              <template #trailing>
                <UIcon
                  name="lucide:arrow-right"
                  class="size-4 transition-transform group-hover:translate-x-1"
                />
              </template>
            </UButton>
          </form>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-4 w-full max-w-md">
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
    </div>
  </div>
</template>
