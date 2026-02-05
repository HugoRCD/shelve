<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { loggedIn, user } = useUserSession()
const colorMode = useColorMode()

const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: user.value?.name || '',
      avatar: {
        src: user.value?.image || ''
      },
      type: 'label'
    }
  ],
  [
    {
      label: 'Profile',
      icon: 'nucleo:user',
      to: '/user/profile'
    },
    {
      label: 'API Tokens',
      icon: 'nucleo:key',
      to: '/user/tokens'
    },
    {
      label: 'Settings',
      icon: 'nucleo:gear-2',
      to: '/user/settings'
    }
  ],
  [
    {
      label: `Turn ${colorMode.value === 'dark' ? 'Light' : 'Dark'} mode`,
      icon: colorMode.value === 'dark' ? 'lucide:sun' : 'lucide:moon',
      onSelect: () => {
        colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark'
      }
    }
  ],
  [
    {
      label: 'Sign out',
      icon: 'heroicons:arrow-left-on-rectangle',
      onSelect: async () => await useLogout()
    }
  ]
])
</script>

<template>
  <UDropdownMenu
    v-if="loggedIn"
    :items

    :content="{
      align: 'end',
      side: 'bottom',
    }"
    :ui="{
      content: 'w-48'
    }"
  >
    <UAvatar :src="user.image" :alt="user.name" size="sm" />
  </UDropdownMenu>
</template>
