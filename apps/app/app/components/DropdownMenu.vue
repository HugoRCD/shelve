<script setup lang="ts">
const navigations = getNavigation('app')
const navItem = navigations.map((nav) => {
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
  [
    {
      label: 'Sign out',
      icon: 'heroicons:arrow-left-on-rectangle',
      iconClass: 'text-red-500 dark:text-red-500',
      click: () => {
        navigateTo('/')
        clear()
      }
    }
  ]
]
</script>

<template>
  <div class="flex items-center justify-center">
    <UDropdown
      v-if="loggedIn"
      :items
      :ui="{
        background: 'backdrop-blur-3xl border dark:bg-gray-950/95 dark:border-gray-400/10 bg-white',
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
    <UButton v-else to="/login" label="Login" color="gray" />
  </div>
</template>


