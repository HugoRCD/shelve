<script setup lang="ts">
const integrations = [
  {
    name: 'Github',
    description: 'Connect Shelve with Github to sync secrets and more...',
    icon: 'simple-icons:github'
  }
]
</script>

<template>
  <div class="flex flex-col gap-4 pb-4">
    <div style="--stagger: 1" data-animate class="flex flex-col gap-3">
      <LayoutSectionHeader title="Integrations" description="Connect Shelve with other services to enhance your experience." />
      <div class="flex flex-col gap-2">
        <NuxtLink v-for="integration in integrations" :key="integration.name" :to="`/user/integrations/${integration.name.toLowerCase()}`">
          <div class="border border-(--ui-border) rounded-lg hover:bg-(--ui-bg-muted) transition-colors duration-200">
            <div class="flex items-center justify-between gap-1 p-4">
              <div class="flex items-center gap-2">
                <UIcon :name="integration.icon" class="size-7" />
                <div class="flex flex-col gap-1">
                  <span class="text-sm font-semibold">{{ integration.name }}</span>
                  <span class="text-xs text-(--ui-text-muted)">{{ integration.description }}</span>
                </div>
              </div>
              <div class="flex items-center gap-1">
                <UBadge variant="soft" color="neutral" label="Connect" />
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
