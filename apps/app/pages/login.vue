<script setup lang="ts">
import type { DeviceInfo } from "@shelve/types";
import UAParser from "ua-parser-js";
import type { Ref } from "vue";

const { title } = useAppConfig();

definePageMeta({
  layout: 'auth',
  middleware: 'guest-only'
});

const route = useRoute();
const otpMode = ref(route.query.email ? true : false);

const user = useCurrentUser();
const email = ref(route.query.email || '');
const password = ref('');
const otp = ref(route.query.otp || '');

const deviceInfo = ref<DeviceInfo>();

const usePassword = useCookie("usePassword") as Ref<boolean>;
const passwordMode = ref(usePassword.value);
defineShortcuts({
  meta_k: {
    usingInput: true,
    handler: () => {
      passwordMode.value = !passwordMode.value;
    }
  }
})

const { status, error, execute } = useFetch("/api/auth/send-code", {
  method: "POST",
  body: { email },
  watch: false,
  immediate: false
})

const { data, status: verifyStatus, error: verifyError, execute: verify } = useFetch("/api/auth/login", {
  method: "POST",
  body: { email, otp, password, deviceInfo },
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
    toast.success(`Welcome back, ${data.value.username || data.value.email}!`);
    user.value = data.value;
    await useRouter().push("/app/projects")
  } else {
    toast.error("An error occurred while verifying your code.");
  }
  otp.value = '';
};

function useLoginOrSendOtp() {
  return passwordMode.value ? login() : sendOtp();
}

onMounted(() => {
  const parser = new UAParser();
  const parserResults = parser.getResult();
  const device = `${parserResults.device.vendor} ${parserResults.device.model}`;
  const os = `${parserResults.os.name} ${parserResults.os.version}`;
  const browser = `${parserResults.browser.name} ${parserResults.browser.version}`;
  deviceInfo.value = {
    userAgent: `${device} - ${os} - ${browser}`,
  }
});
</script>

<template>
  <div class="mx-auto flex h-full max-w-sm flex-col items-center justify-center p-5">
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
        <form v-if="!otpMode" class="mt-8 flex flex-col gap-4" @submit.prevent="useLoginOrSendOtp" @keydown.enter.prevent="useLoginOrSendOtp">
          <UInput v-model="email" label="Email address" type="email" required placeholder="email" />
          <UInput
            v-if="passwordMode"
            v-model="password"
            label="Password"
            type="password"
            required
            placeholder="password"
          />
          <UButton type="submit" class="flex w-full items-center justify-center gap-2 rounded-md bg-black px-4 py-2 text-sm text-white transition-colors duration-300 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100">
            {{ passwordMode ? "Login" : "Send me a magic link" }}
            <Loader v-if="passwordMode ? verifyStatus === 'pending' : status === 'pending'" />
          </UButton>
        </form>
        <form v-else class="mt-8 flex flex-col gap-4" @submit.prevent="login" @keydown.enter.prevent="login">
          <OTP v-model="otp" :disabled="verifyStatus === 'pending'" @otp:full="login" />
          <UButton
            type="submit"
            :loading="verifyStatus === 'pending'"
            class="flex w-full items-center justify-center gap-2 rounded-md bg-black px-4 py-2 text-sm text-white transition-colors duration-300 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100"
          >
            Verify code
          </UButton>
        </form>
      </Transition>
    </div>
  </div>
</template>
