<script setup lang="ts">
const { loggedIn, user } = useUserSession()

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
      onSelect: async () => await useLogout()
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
          <p class="truncate font-medium">
            {{ item.label }}
          </p>
        </div>
      </template>
    </UDropdownMenu>
    <UButton v-else to="/login" label="Login" variant="soft" />
  </div>
</template>
