<script setup lang="ts">
import Loader from "~/components/Loader.vue";

const { title } = useAppConfig();

definePageMeta({
  layout: 'auth',
});

const email = ref('');

const loading = ref(false);

const { status, error, execute } = useFetch("/api/send-code", {
  method: "POST",
  body: { email },
  watch: false,
  immediate: false
})

const login = async () => {
  if (!email.value) {
    toast.error("Please fill in all required fields.");
    return;
  }
  await execute();
  if (!error.value) {
    email.value = "";
    toast.success("Your code has been sent!");
  } else {
    toast.error("An error occurred while sending your code.");
  }
};
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center">
    <div class="flex flex-col justify-center gap-4">
      <div class="flex flex-col items-center justify-center space-y-2 text-center">
        <h1 class="text-center text-3xl font-semibold leading-9">
          Login to <span class="font-newsreader font-light italic">{{ title }}</span>
        </h1>
        <p class="max-w-sm text-pretty text-sm leading-5 text-tertiary">
          If you gained access to {{ title }}, you can enter your credentials here
        </p>
      </div>
      <form class="mt-8 flex flex-col gap-4" @submit.prevent="login" @keydown.enter.prevent="login">
        <CInput v-model="email" label="Email address" type="email" required placeholder="email" />
        <button type="submit" class="flex w-full items-center justify-center gap-2 rounded-md bg-black px-4 py-2 text-sm text-white transition-colors duration-300 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100">
          Send me a magic link
          <Loader v-if="status === 'pending'" />
        </button>
      </form>
      <button class="flex items-center justify-center gap-2 text-sm text-black transition-colors duration-300 dark:text-white">
        <span class="i-lucide-github size-5 fill-inverted" />
        <span class="text-sm font-semibold leading-6">GitHub</span>
      </button>
    </div>
  </div>
</template>
