<script setup lang="ts">
import { Role } from '@shelve/types'

const teamNavigations = getNavigation('team')
const navItem = teamNavigations.map((nav) => {
  return {
    label: nav.name,
    icon: nav.icon,
    to: nav.path,
  }
})

const userNavigations = getNavigation('user')
const userNavItem = userNavigations.map((nav) => {
  return {
    label: nav.name,
    icon: nav.icon,
    to: nav.path,
  }
})

const adminNavigations = getNavigation('admin')
const adminNavItem = adminNavigations.map((nav) => {
  return {
    label: nav.name,
    icon: nav.icon,
    to: nav.path,
  }
})

const { loggedIn, user, clear } = useUserSession()

const items = [
  [
    {
      label: user.value?.email || '',
      slot: 'account',
      disabled: true
    }
  ],
  navItem,
  userNavItem,
  ...(user.value?.role === Role.ADMIN ? [adminNavItem] : []),
  [
    {
      label: 'Sign out',
      icon: 'heroicons:arrow-left-on-rectangle',
      onSelect: async () => {
        await clear()
        navigateTo('/login')
      }
    }
  ]
]
</script>

<template>
  <div class="flex items-center justify-center">
    <UDropdownMenu
      v-if="loggedIn"
      :items
      :popper="{ placement: 'bottom-start' }"
    >
      <UAvatar :src="user.avatar" :alt="user.username" class="cursor-pointer" />

      <template #account="{ item }">
        <div class="text-left">
          <p>
            Signed in as
          </p>
          <p class="truncate font-medium text-neutral-900 dark:text-white">
            {{ item.label }}
          </p>
        </div>
      </template>
    </UDropdownMenu>
    <UButton v-else to="/login" label="Login" color="neutral" variant="soft" />
  </div>
</template>
