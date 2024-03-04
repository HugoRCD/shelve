<script setup lang="ts">
const { title } = useAppConfig();

definePageMeta({
  layout: 'auth',
  middleware: 'already-auth'
});

const route = useRoute();
const otpMode = ref(route.query.email ? true : false);

const email = ref(route.query.email || '');
const otp = ref('');

const { status, error, execute } = useFetch("/api/auth/send-code", {
  method: "POST",
  body: { email },
  watch: false,
  immediate: false
})

const { data, status: verifyStatus, error: verifyError, execute: verify } = useFetch("/api/auth/verify", {
  method: "POST",
  body: { email, otp },
  watch: false,
  immediate: false
})

const sendOtp = async () => {
  if (!email.value) {
    toast.error("Please fill in all required fields.");
    return;
  }
  await execute();
  if (!error.value) {
    toast.success("Your code has been sent!");
    otpMode.value = true;
  } else {
    toast.error("An error occurred while sending your code.");
  }
};

const login = async () => {
  if (!otp) {
    toast.error("Please fill in all required fields.");
    return;
  }
  await verify();
  if (!verifyError.value && data.value) {
    toast.success(`Welcome back, ${data.value.email}!`);
    useCurrentUser().value = data.value;
    await useRouter().push("/app/dashboard")
  } else {
    toast.error("An error occurred while verifying your code.");
  }
  otp.value = '';
};
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center">
    <div class="flex flex-col justify-center gap-4">
      <div class="flex flex-col items-center justify-center space-y-2 text-center">
        <h1 class="text-center text-3xl leading-9">
          Login to <span class="font-newsreader font-light italic">{{ title }}</span>
        </h1>
        <p class="max-w-sm text-pretty text-sm leading-5 text-tertiary">
          If you gained access to {{ title }}, you can enter your credentials here
        </p>
        <button class="text-sm text-black transition-colors duration-300 dark:text-white" @click="otpMode = !otpMode">
          {{ otpMode ? "Send me a magic link" : "I have a magic code" }}
        </button>
      </div>
      <Transition name="fade" mode="out-in">
        <form v-if="!otpMode" class="mt-8 flex flex-col gap-4" @submit.prevent="sendOtp" @keydown.enter.prevent="sendOtp">
          <CInput v-model="email" label="Email address" type="email" required placeholder="email" />
          <button type="submit" class="flex w-full items-center justify-center gap-2 rounded-md bg-black px-4 py-2 text-sm text-white transition-colors duration-300 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100">
            Send me a magic link
            <Loader v-if="status === 'pending'" />
          </button>
        </form>
        <form v-else class="mt-8 flex flex-col gap-4" @submit.prevent="login" @keydown.enter.prevent="login">
          <OTP v-model="otp" :disabled="verifyStatus === 'pending'" @otp:full="login" />
          <button type="submit" class="flex w-full items-center justify-center gap-2 rounded-md bg-black px-4 py-2 text-sm text-white transition-colors duration-300 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100">
            Verify code
            <Loader v-if="verifyStatus === 'pending'" />
          </button>
        </form>
      </Transition>
      <button class="flex items-center justify-center gap-2 text-sm text-black transition-colors duration-300 dark:text-white">
        <span class="i-lucide-github size-5 fill-inverted" />
        <span class="text-sm font-semibold leading-6">GitHub</span>
      </button>
    </div>
  </div>
</template>
