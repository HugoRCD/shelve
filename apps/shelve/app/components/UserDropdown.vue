<script setup lang="ts">
const { loggedIn, user, clear } = useUserSession()

const items = [
  [
    {
      label: user.value?.email || '',
      slot: 'account',
      disabled: true
    }
  ],
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
    >
      <UAvatar :src="user.avatar" :alt="user.username" size="sm" class="cursor-pointer" />

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
    <UButton v-else to="/login" label="Login" variant="soft" />
  </div>
</template>
