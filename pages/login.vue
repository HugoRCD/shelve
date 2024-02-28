<script setup lang="ts">
definePageMeta({
  layout: 'auth',
});

const loading = ref(false);

const login = async () => {
  loading.value = true;
  await new Promise((resolve) => setTimeout(resolve, 2000));
  loading.value = false;
};
</script>

<template>
  <div class="flex min-h-full flex-1">
    <div class="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
      <div class="mx-auto w-full max-w-sm lg:w-96">
        <div>
          <Logo
            :size="2"
            :is-logo="false"
            is-text
          />
          <h2 class="mt-8 text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Sign in to your account
          </h2>
          <p class="mt-2 text-sm leading-6 text-gray-500">
            Not a member?
            <NuxtLink
              to="/signup"
              class="font-semibold text-accent hover:text-accent"
            >
              Sign up now
            </NuxtLink>
          </p>
        </div>

        <div class="mt-10">
          <form
            method="POST"
            class="space-y-6"
            @submit.prevent="login"
          >
            <div>
              <label
                for="email"
                class="block text-sm font-medium leading-6 text-gray-900"
              >Email address</label>
              <div class="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  required
                  class="input"
                >
              </div>
            </div>

            <div>
              <label
                for="password"
                class="block text-sm font-medium leading-6 text-gray-900"
              >Password</label>
              <div class="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autocomplete="current-password"
                  required
                  class="input"
                >
              </div>
            </div>

            <div class="flex items-center justify-end">
              <div class="text-sm leading-6">
                <a
                  href="#"
                  class="font-semibold text-accent hover:text-accent"
                >Forgot password?</a>
              </div>
            </div>

            <div>
              <Btn
                type="submit"
                :loading
              >
                Sign in
              </Btn>
            </div>
          </form>
        </div>
      </div>
    </div>
    <div class="relative hidden w-0 flex-1 lg:block">
      <NuxtImg
        class="absolute inset-0 size-full object-cover"
        src="https://images.unsplash.com/photo-1496917756835-20cb06e75b4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1908&q=80"
        alt=""
      />
    </div>
  </div>
</template>

<style scoped>

</style>
