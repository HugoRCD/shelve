<script setup lang="ts">
const appUrl = 'https://f327-2a04-cec2-21-4f1a-dd73-2dc5-ade4-3be8.ngrok-free.app' // window.location.origin

const manifest = {
  name: 'shelve-cloud',
  url: appUrl,
  hook_attributes: {
    url: `${appUrl}/api/githook`
  },
  redirect_url: `${appUrl}/user/integrations`,
  callback_urls: [`${appUrl}/user/integrations`],
  setup_url: `${appUrl}/user/integrations`,
  description: 'Shelve GitHub App',
  public: false,
  default_permissions: {
    issues: 'write',
    pull_requests: 'write',
    contents: 'write',
    metadata: 'read',
  },
  default_events: ['push'],
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
        <h2 class="text-lg font-bold">
          Integrations
        </h2>
        <p class="text-sm text-neutral-500">
          Connect Shelve with other services to enhance your experience.
        </p>
      </div>
      <div>
        <form action="https://github.com/settings/apps/new" method="post">
          <input id="manifest" type="text" name="manifest" class="hidden" :value="JSON.stringify(manifest)">
          <UButton icon="simple-icons:github" label="Create GitHub App" type="submit" />
        </form>
      </div>
    </div>
  </div>
</template>
