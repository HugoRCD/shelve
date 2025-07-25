<script setup lang="ts">
import { ConfirmModal } from '#components'

const { user, clear } = useUserSession()

const updateLoading = ref(false)

async function updateCurrentUser() {
  updateLoading.value = true
  try {
    await $fetch('/api/user', {
      method: 'PUT',
      body: {
        username: user.value!.username,
        avatar: user.value!.avatar,
      },
    })
    toast.success('Profile updated successfully')
  } catch (e) {
    toast.error('An error occurred')
  }
  updateLoading.value = false
}

async function deleteUser() {
  await $fetch('/api/user', {
    method: 'DELETE',
  })
  await clear()
  await useRouter().push('/login')
}

const overlay = useOverlay()
const modal = overlay.create(ConfirmModal)

function deleteAccount() {
  modal.open({
    title: 'Delete my account',
    description: `You are about to delete ${user.value!.username}. This action cannot be undone and all data associated with this account will be lost.`,
    danger: true,
    onSuccess() {
      toast.promise(deleteUser(), {
        loading: 'Deleting account...',
        success: 'Account deleted successfully',
        error: 'Error deleting account',
      })
    },
  })
}

useSeoMeta({
  title: () => `Profile - ${user.value?.username}`,
})

definePageMeta({
  title: 'User Profile',
})
</script>

<template>
  <PageSection
    v-if="user"
    title="Personal Information"
    description="Update your personal information"
    :image="user.avatar"
  >
    <form class="flex flex-col" @submit.prevent="updateCurrentUser">
      <div class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
        <div class="sm:col-span-3">
          <UFormField label="Username">
            <UInput v-model="user.username" class="w-full" />
          </UFormField>
        </div>
        <div class="sm:col-span-3">
          <UFormField label="Email">
            <UInput v-model="user.email" disabled class="w-full" />
          </UFormField>
        </div>
        <div class="sm:col-span-4">
          <UFormField label="Avatar">
            <UInput v-model="user.avatar" class="w-full" />
          </UFormField>
        </div>
      </div>
      <div class="mt-6 flex items-center justify-between gap-2">
        <UButton type="submit" :loading="updateLoading">
          Save
        </UButton>
        <UButton color="error" @click="deleteAccount">
          Delete Account
        </UButton>
      </div>
    </form>
  </PageSection>
</template>
