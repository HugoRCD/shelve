<script setup lang="ts">
const user = useSession().user;

const { status, error, execute } = useFetch("/api/user", {
  method: "PUT",
  body: user,
  watch: false,
  immediate: false,
})

async function updateCurrentUser() {
  await execute();
  if (error.value) toast.error("An error occurred");
  else toast.success("Your data has been updated");
}
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
          Use a permanent address where you can receive mail.
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
    <div style="--stagger: 3" data-animate class="mt-6 flex gap-2">
      <UButton type="submit" :loading="status === 'pending'">
        Save
      </UButton>
    </div>
  </form>
</template>

<style scoped>

</style>
