<script setup lang="ts">
const navigations = getNavigation("app");
const navItem = navigations.map((nav) => {
  return {
    label: nav.name,
    icon: nav.icon,
    to: nav.to,
  }
})

const user = useSession().user

const items = [
  [
    {
      label: user.value.email,
      slot: 'account',
      disabled: true
    }
  ],
  navItem,
  [
    {
      label: 'Sign out',
      icon: 'i-heroicons-arrow-left-on-rectangle',
      iconClass: "text-red-500 dark:text-red-500",
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
      background: 'bg-white dark:bg-neutral-900',
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

    <template #item="{ item }">
      <span class="truncate">{{ item.label }}</span>

      <UIcon :name="item.icon" class="ms-auto size-4 shrink-0 text-gray-400 dark:text-gray-500" />
    </template>
  </UDropdown>
</template>

