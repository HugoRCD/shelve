<script setup lang="ts">
definePageMeta({
  title: 'Github Integration',
  name: 'Integrations'
})

const appUrl = 'https://f327-2a04-cec2-21-4f1a-dd73-2dc5-ade4-3be8.ngrok-free.app' // window.location.origin

const manifest = {
  name: 'shelve-cloud',
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

async function fetchRepos() {
  const data = await $fetch('/api/github/repos')
  console.log(data)
}
</script>

<template>
  <div class="flex flex-col gap-4 pb-4">
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
      <div class="flex flex-col gap-2">
        <form action="https://github.com/settings/apps/new" method="post">
          <input id="manifest" type="text" name="manifest" class="hidden" :value="JSON.stringify(manifest)">
          <UButton icon="simple-icons:github" label="Create GitHub App" type="submit" />
        </form>
        <!--        <UButton icon="simple-icons:github" label="Fetch Repos" loading-auto @click="fetchRepos" />-->
      </div>
    </div>
  </div>
</template>
