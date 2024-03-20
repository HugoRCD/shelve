<script setup lang="ts">
const user = useSession().user

const password = ref("");
const passwordConfirmation = ref("");
const errorMessage = ref("");

const updateLoading = ref(false);

const { data: sessions, status: sessionsStatus, refresh } = useFetch("/api/user/session", {
  method: "GET",
})

const { status: logoutStatus, error: logoutError, execute: logout } = useFetch("/api/user/session", {
  method: "DELETE",
  watch: false,
  immediate: false,
})

async function updateCurrentUser() {
  updateLoading.value = true;
  if (password.value !== passwordConfirmation.value) {
    errorMessage.value = "Passwords do not match";
    toast.error("Passwords do not match");
    return;
  }
  try {
    await $fetch("/api/user", {
      method: "PUT",
      body: {
        username: user.value!.username,
        avatar: user.value!.avatar,
        password: password.value,
      },
    });
    toast.success("Profile updated successfully");
  } catch (e) {
    console.error(e);
    toast.error("An error occurred");
  }
  updateLoading.value = false;
  password.value = "";
  passwordConfirmation.value = "";
}

watch([password, passwordConfirmation], () => {
  errorMessage.value = "";
});

async function logoutAll() {
  await logout()
  if (logoutError.value) toast.error("An error occurred")
  else {
    toast.success("You have been logged out from all devices")
    await refresh()
  }
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
          <p class="text-sm leading-6 text-gray-500">
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
        <div class="sm:col-span-3">
          <FormGroup v-model="password" label="Password" type="password" />
        </div>
        <div class="sm:col-span-3">
          <FormGroup v-model="passwordConfirmation" label="Confirm Password" type="password" />
        </div>
      </div>
      <div v-if="errorMessage" class="mt-1">
        <span class="text-sm text-red-500">{{ errorMessage }}</span>
      </div>
      <div style="--stagger: 3" data-animate class="mt-6 flex gap-2">
        <UButton type="submit" :loading="updateLoading">
          Save
        </UButton>
      </div>
    </form>
    <UDivider style="--stagger: 4" data-animate class="my-8" />
    <form style="--stagger: 5" data-animate>
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-semibold leading-7">
            Your Sessions
          </h2>
          <p class="text-sm leading-6 text-gray-500">
            Manage your active sessions
          </p>
        </div>
        <UButton color="gray" variant="ghost" :loading="logoutStatus === 'pending'" @click="logoutAll">
          Logout all
        </UButton>
      </div>
      <div class="mt-6">
        <div v-if="sessionsStatus !== 'pending'" class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <AuthSession v-for="session in sessions!.sort((device) => device.current ? -1 : 1)" :key="session.id" :session @refresh="refresh" />
        </div>
        <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <USkeleton v-for="i in 4" :key="i" class="h-32" />
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped>

</style>
