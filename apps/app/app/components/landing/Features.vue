<script setup lang="ts">
const features = [
  {
    title: 'Manage your projects secrets',
    description: 'End Slack messages like "Can you send me .env file?", keep your secrets in one place and share them with your team.',
    icon: 'lucide:lock',
  },
  {
    title: 'Collaborate with your team',
    description: 'Create, invite and manage your team members to work together on your projects in seconds.',
    icon: 'lucide:users',
  },
  {
    title: 'Powerful CLI',
    description: 'Manage your projects secrets, files and more withour leaving your terminal.',
    icon: 'lucide:terminal',
  },
  {
    title: 'Shared env variables',
    description: 'Create shared env variables that can be used across all your projects.',
    icon: 'lucide:share',
    soon: true,
  },
  {
    title: 'Sync with your favorite tools',
    description: 'Integrate with your favorite tools like GitHub, Vercel, etc...',
    icon: 'custom:github',
    soon: true,
  },
  {
    title: 'Talk to project',
    description: 'Talk to your project with built in trained AI on your project data.',
    icon: 'lucide:message-square',
    soon: true,
  }
]
</script>

<template>
  <div class="mx-auto max-w-5xl">
    <div class="mb-10 flex flex-col items-center justify-center gap-2">
      <h3 class="main-gradient">
        <LandingScrambleText label="Features" />
      </h3>
      <p class="max-w-lg text-pretty text-center text-sm text-gray-500 sm:text-base">
        No more tedious tasks, Shelve has everything you need to manage your projects.
      </p>
    </div>
    <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-y-16">
      <div
        v-for="(feature, index) in features"
        :key="index"
        class="flex flex-col gap-1"
        :style="{ '--stagger': index + 1 }"
        data-animate
      >
        <div class="flex items-center">
          <div class="flex items-center justify-center rounded border border-white/5 bg-white/5 p-1">
            <UIcon :name="feature.icon" class="size-5 fill-white text-gray-300" />
          </div>

          <div class="ml-4 text-gray-300">
            {{ feature.title }}<span v-if="feature.soon" class="ml-1 text-xs text-gray-400">(soon)</span>
          </div>
        </div>

        <div class="ml-11 pl-0.5 text-sm text-gray-500">
          {{ feature.description }}
        </div>
      </div>
    </div>
  </div>
</template>
