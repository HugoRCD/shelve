<script setup lang="ts">
const nav = [
  {
    name: 'Support',
    icon: 'i-lucide-life-buoy',
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
      {
        name: 'Status',
        to: 'https://shelve.betteruptime.com/',
      }
    ],
  },
  {
    name: 'Community',
    icon: 'i-lucide-users',
    sub: [
      {
        name: 'GitHub',
        to: 'https://github.com/HugoRCD/shelve/issues',
      },
    ],
  },
  {
    name: 'Legal',
    icon: 'i-lucide-shield',
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
    <hr class="border-gray-800">
    <footer class="mt-6 flex flex-col justify-around gap-8 p-5 sm:flex-row sm:gap-0">
      <div class="flex flex-col gap-1">
        <NuxtLink to="/" class="font-newsreader text-2xl font-light italic">
          Shelve
        </NuxtLink>
        <div class="text-xs text-gray-500">
          © {{ new Date().getFullYear() }} - Made with 💚 by <NuxtLink to="https://hrcd.fr/" class="text-gray-400 hover:text-gray-200">
            HugoRCD
          </NuxtLink>
        </div>
      </div>
      <div class="flex gap-10">
        <div v-for="item in nav" :key="item.name" class="flex flex-col gap-3">
          <div class="flex items-center gap-1.5">
            <span :class="item.icon" class="text-gray-300" />
            <div class="text-sm font-semibold text-gray-200 sm:text-lg">
              {{ item.name }}
            </div>
          </div>
          <div v-if="item.sub" class="flex flex-col gap-3">
            <NuxtLink
              v-for="sub in item.sub"
              :key="sub.name"
              class="text-sm text-gray-400 hover:text-gray-400"
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
