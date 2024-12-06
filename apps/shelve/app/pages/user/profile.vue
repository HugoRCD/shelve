<script setup lang="ts">
const { user } = useUserSession()

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
</script>

<template>
  <div class="flex flex-col">
    <form v-if="user" class="flex flex-col" @submit.prevent="updateCurrentUser">
      <div style="--stagger: 1" data-animate class="flex items-center gap-4">
        <NuxtImg :src="user.avatar" class="size-10 rounded-full" />
        <div>
          <h2 class="text-base font-semibold leading-7">
            Personal Information
          </h2>
          <p class="text-sm leading-6 text-neutral-500">
            Update your personal information
          </p>
        </div>
      </div>
      <div style="--stagger: 2" data-animate class="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
        <div class="sm:col-span-3">
          <FormGroup v-model="user.username" label="Username" />
        </div>
        <div class="sm:col-span-3">
          <FormGroup v-model="user.email" label="Email" disabled />
        </div>
        <div class="sm:col-span-4">
          <FormGroup v-model="user.avatar" label="Avatar" />
        </div>
      </div>
      <div style="--stagger: 4" data-animate class="mt-6 flex items-center gap-2">
        <UButton type="submit" :loading="updateLoading">
          Save
        </UButton>
      </div>
    </form>
  </div>
</template>
