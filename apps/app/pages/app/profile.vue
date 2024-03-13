<script setup lang="ts">
const user = useSession().user;

const password = ref("");
const passwordConfirmation = ref("");
const errorMessage = ref("");

const { status, error, execute } = useFetch("/api/user", {
  method: "PUT",
  body: user,
  watch: false,
  immediate: false,
})

async function updateCurrentUser() {
  if (password.value !== passwordConfirmation.value) {
    errorMessage.value = "Passwords do not match";
    toast.error("Passwords do not match");
    return;
  }
  await execute();
  if (error.value) toast.error("An error occurred");
  else toast.success("Your data has been updated");
  password.value = "";
  passwordConfirmation.value = "";
}

watch([password, passwordConfirmation], () => {
  errorMessage.value = "";
});
</script>

<template>
  <form class="flex flex-col" @submit.prevent="updateCurrentUser">
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
      <UButton type="submit" :loading="status === 'pending'">
        Save
      </UButton>
    </div>
  </form>
</template>

<style scoped>

</style>
