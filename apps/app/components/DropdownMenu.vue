<script setup lang="ts">
import type { publicUser } from '@shelve/types'
import type { Ref } from 'vue'

const navigations = getNavigation('app')
const admin_navigations = getNavigation('admin')
const navItem = navigations.map((nav) => {
  return {
    label: nav.name,
    icon: nav.icon,
    to: nav.to,
  }
})
const adminNavItem = admin_navigations.map((nav) => {
  return {
    label: nav.name,
    icon: nav.icon,
    to: nav.to,
  }
})


const user = useCurrentUser() as Ref<publicUser>

const items = [
  [
    {
      label: user.value.email,
      slot: 'account',
      disabled: true
    }
  ],
  navItem,
  adminNavItem,
  [
    {
      label: 'Sign out',
      icon: 'i-heroicons-arrow-left-on-rectangle',
      iconClass: 'text-red-500 dark:text-red-500',
      click: () => useSession().clear()
    }
  ]
]
</script>

<template>
  <UDropdown
    v-if="user"
    :items="items"
    :ui="{
      background: 'backdrop-blur-md border dark:bg-gray-950/50 dark:border-gray-400/10 bg-white',
      ring: 'ring-1 ring-neutral-100 dark:ring-neutral-800',
      divide: 'divide-y divide-neutral-100 dark:divide-neutral-800',
      item: {
        active: 'bg-neutral-100 dark:bg-neutral-800',
        disabled: 'cursor-text select-text'
      }
    }"
    :popper="{ placement: 'bottom-start' }"
  >
    <UAvatar :src="user.avatar" :alt="user.username" />

    <template #account="{ item }">
      <div class="text-left">
        <p>
          Signed in as
        </p>
        <p class="truncate font-medium text-gray-900 dark:text-white">
          {{ item.label }}
        </p>
      </div>
    </template>
  </UDropdown>
</template>

