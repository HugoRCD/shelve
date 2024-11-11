<script setup lang="ts">
const nav = [
  {
    name: 'Support',
    icon: 'lucide:life-buoy',
    sub: [
      {
        name: 'Documentation',
        to: '/',
      },
      {
        name: 'FAQ',
        to: '/',
      },
      {
        name: 'Roadmap',
        to: 'https://volta.net/HugoRCD/shelve',
      },
    ],
  },
  {
    name: 'Community',
    icon: 'lucide:users',
    sub: [
      {
        name: 'GitHub',
        to: 'https://github.com/HugoRCD/shelve/issues',
      },
    ],
  },
  {
    name: 'Legal',
    icon: 'lucide:shield',
    sub: [
      {
        name: 'Privacy',
        to: '/',
      },
      {
        name: 'Terms',
        to: '/',
      },
    ],
  },
]
</script>

<template>
  <div class="my-6">
    <div class="relative">
      <div class="flex">
        <NuxtLink to="/docs" class="group -mb-px -ml-px flex w-full cursor-pointer justify-between gap-2 border border-neutral-800 border-opacity-50 p-4 text-xs text-neutral-500 transition-all duration-300 ease-in-out hover:border-opacity-100 hover:bg-neutral-800/50 hover:text-neutral-200">
          <span class="text-neutral-400">
            Documentation
          </span>
          <UIcon name="lucide:arrow-right" class="ml-1 inline-block text-neutral-400 transition-all duration-300 ease-in-out group-hover:-rotate-45" />
        </NuxtLink>
        <NuxtLink
          to="https://app.shelve.cloud/login"
          class="group -mb-px -ml-px flex w-full cursor-pointer justify-between gap-2 border border-neutral-800 border-opacity-50 p-4 text-xs text-neutral-500 transition-all duration-300 ease-in-out hover:border-opacity-100 hover:bg-neutral-800/50 hover:text-neutral-200"
        >
          <span class="text-neutral-400">
            Login
          </span>
          <UIcon name="lucide:arrow-right" class="ml-1 inline-block text-neutral-400 transition-all duration-300 ease-in-out group-hover:-rotate-45" />
        </NuxtLink>
      </div>
    </div>
    <hr class="border-neutral-800">
    <footer class="mt-6 flex flex-col justify-around gap-8 p-5 sm:flex-row sm:gap-0">
      <div class="flex flex-col gap-1">
        <NuxtLink to="/" class="font-newsreader text-2xl font-light italic">
          Shelve
        </NuxtLink>
        <div class="text-xs text-neutral-500">
          © {{ new Date().getFullYear() }} - Made with 💚 by <NuxtLink to="https://hrcd.fr/" class="text-neutral-400 hover:text-neutral-200">
            HugoRCD
          </NuxtLink>
        </div>
        <div style="color-scheme: none;" class="mt-4">
          <iframe src="https://status.shelve.cloud/badge?theme=dark" height="30" />
        </div>
      </div>
      <div class="flex gap-10">
        <div v-for="item in nav" :key="item.name" class="flex flex-col gap-3">
          <div class="flex items-center gap-1.5">
            <UIcon :name="item.icon" class="text-neutral-300" />
            <div class="text-sm font-semibold text-neutral-200 sm:text-lg">
              {{ item.name }}
            </div>
          </div>
          <div v-if="item.sub" class="flex flex-col gap-3">
            <NuxtLink
              v-for="sub in item.sub"
              :key="sub.name"
              class="text-sm text-neutral-400 hover:text-neutral-400"
              :to="sub.to"
            >
              {{ sub.name }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
