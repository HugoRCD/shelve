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
</script>

<template>
  <div class="flex flex-col">
    <form v-if="user" class="flex flex-col" @submit.prevent="updateCurrentUser">
      <LayoutSectionHeader
        style="--stagger: 1"
        data-animate
        title="Personal Information"
        description="Update your personal information"
        :image="user.avatar"
      />
      <div style="--stagger: 2" data-animate class="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
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
      <div style="--stagger: 4" data-animate class="mt-6 flex items-center justify-between gap-2">
        <UButton type="submit" :loading="updateLoading">
          Save
        </UButton>
        <UButton color="error" @click="deleteAccount">
          Delete Account
        </UButton>
      </div>
    </form>
  </div>
</template>
