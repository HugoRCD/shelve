<script setup lang="ts">
import Divider from "~/components/layout/Divider.vue";
import CButton from "~/components/CButton.vue";

definePageMeta({
  layout: 'auth',
});

const loginDto = ref({
  email: '',
  password: '',
});

const loading = ref(false);

const login = async () => {
  loading.value = true;
  await new Promise((resolve) => setTimeout(resolve, 1500));
  console.log(loginDto.value);
  toast.success(`Welcome back, ${loginDto.value.email} !`);
  loading.value = false;
};
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center bg-secondary">
    <div class="w-full max-w-xl rounded-md bg-primary p-8 shadow-md">
      <div>
        <Logo :size="2" :is-logo="false" is-text />
        <h2 class="mt-8 text-2xl font-bold leading-9 tracking-tight text-primary">
          Sign in to your account
        </h2>
        <p class="mt-2 text-sm leading-6 text-gray-500">
          Not a member?
          <NuxtLink to="/signup" class="font-semibold text-accent hover:text-accent-hover">
            Sign up now
          </NuxtLink>
        </p>
      </div>
      <form method="POST" class="mt-10 space-y-6" @submit.prevent="login">
        <FormGroup v-model="loginDto.email" label="Email address" type="email" required />
        <FormGroup v-model="loginDto.password" label="Password" type="password" required />
        <div class="flex items-center justify-end">
          <NuxtLink to="#" class="text-sm font-semibold leading-6 text-accent hover:text-accent-hover">
            Forgot password?
          </NuxtLink>
        </div>
        <CButton type="submit" :loading>
          Sign in
        </CButton>
      </form>

      <div class="relative my-10">
        <Divider text="Or continue with" />
      </div>

      <AuthGithub />

      <div class="mt-4 flex items-center justify-center">
        <SettingThemeToggle size="size-6" />
      </div>
    </div>
  </div>
</template>
