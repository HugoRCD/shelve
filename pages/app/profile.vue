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
  <div class="mx-auto max-w-2xl py-6 sm:px-6 lg:px-8">
    <form class="flex flex-col" @submit.prevent="updateCurrentUser">
      <h2 class="text-base font-semibold leading-7">
        Personal Information
      </h2>
      <p class="text-sm leading-6 text-gray-500">
        Use a permanent address where you can receive mail.
      </p>
      <div class="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div class="sm:col-span-3">
          <label for="first-name" class="block text-sm font-medium leading-6"> Username </label>
          <div class="mt-2">
            <CInput v-model="user.username" />
          </div>
        </div>

        <div class="sm:col-span-3">
          <label for="email" class="block text-sm font-medium leading-6"> Email address </label>
          <div class="mt-2">
            <CInput v-model="user.email" disabled />
          </div>
        </div>

        <div class="sm:col-span-4">
          <label for="last-name" class="block text-sm font-medium leading-6"> Avatar </label>
          <div class="mt-2">
            <CInput v-model="user.avatar" />
          </div>
        </div>
      </div>
      <div class="mt-6 flex gap-2">
        <CButton type="submit" :loading="status === 'pending'">
          Save
        </CButton>
      </div>
    </form>
  </div>
</template>

<style scoped>

</style>
