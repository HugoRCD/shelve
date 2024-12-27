<script setup lang="ts">
import { getRandomGithubAppName } from '~~/server/utils/random'

definePageMeta({
  title: 'Github Integration',
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

async function deleteApp(slug: string) {
  try {
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
  } catch (error) {
    toast.error('Failed to delete Github App')
  }
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
          <UIcon name="simple-icons:github" class="size-5" />
          Github
        </h2>
        <p class="text-sm text-neutral-500">
          Create Github App to easily interact with Github
        </p>
      </div>
      <div v-if="status !== 'pending'" class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div v-for="app in data" :key="app.id" class="border border-neutral-200 dark:border-neutral-800 rounded-lg">
          <div class="flex items-center justify-between gap-1 p-4">
            <div class="flex items-center gap-2">
              <div class="flex flex-col gap-1">
                <span class="text-sm font-semibold">{{ app.slug }}</span>
                <NuxtLink
                  :to="`https://github.com/apps/${app.slug}/installations/new`"
                  target="_blank"
                  class="text-xs text-neutral-500 hover:text-neutral-700"
                >
                  Manage repositories
                </NuxtLink>
                <NuxtLink
                  :to="`https://github.com/settings/apps/${app.slug}/permissions`"
                  target="_blank"
                  class="text-xs text-neutral-500 hover:text-neutral-700"
                >
                  Permissions
                </NuxtLink>
              </div>
            </div>
            <UButton icon="lucide:trash" variant="soft" size="xs" loading-auto @click="deleteApp(app.slug)" />
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
