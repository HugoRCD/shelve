<script setup lang="ts">
const { title } = useAppConfig()

definePageMeta({
  layout: 'auth',
  middleware: 'guest-only'
})

const route = useRoute()
const otp = ref(false)
const focus = ref(false)
const email = ref('')

if (route.query.error === 'github' || route.query.error === 'google') {
  toast.error(`An error occurred while logging in with ${route.query.error}.`, {
    duration: Infinity,
    closeButton: false,
    action: {
      label: 'Dismiss',
      onClick: () => useRouter().push('/login')
    }
  })
}
</script>

<template>
  <div class="flex overflow-hidden size-full flex-col items-center justify-center">
    <div class="bg-white rounded-full w-50 h-96 blur-[250px] absolute -top-40 select-none" />
    <div class="mx-auto w-full flex flex-col items-center justify-center gap-2 text-center">
      <UIcon name="custom:shelve" class="size-10" />
      <div class="flex flex-col items-center gap-1">
        <h1 class="text-center text-3xl leading-9">
          Sign in to {{ title }}
        </h1>
        <p class="text-neutral-500 italic dark:text-neutral-400">
          Welcome to the future of environment management.
        </p>
      </div>
    </div>
    <div class="relative mt-6">
      <CrossedDiv line @mouseover="focus = true" @mouseleave="focus = false">
        <div
          class="px-8 py-6 flex flex-col items-center justify-center gap-4 overflow-hidden will-change-auto transition-all delay-200 duration-200 ease-in-out"
          :style="{
            height: focus ? '140px' : '120px',
            width: focus ? '300px' : '250px',
          }"
        >
          <a href="/auth/github">
            <UButton icon="simple-icons:github" label="Sign in with GitHub" />
          </a>
          <a href="/auth/google">
            <UButton icon="simple-icons:google" label="Sign in with Google" />
          </a>
          <!--          <UButton icon="lucide:mail" label="Sign in with Email" variant="soft"  @click="otp = !otp" />
          <Transition name="blur" mode="out-in">
            <div v-show="otp" class="flex items-center gap-2">
              <UInput v-model="email" label="Email" placeholder="Email" type="email" />
              <UButton icon="lucide:mail" label="Send OTP"  />
            </div>
          </Transition>-->
        </div>
      </CrossedDiv>
    </div>
  </div>
</template>
