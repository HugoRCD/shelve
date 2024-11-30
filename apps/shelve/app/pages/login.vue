<script setup lang="ts">
const { title } = useAppConfig()

definePageMeta({
  layout: 'auth',
  middleware: 'guest-only'
})

const route = useRoute()

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
  <div class="flex overflow-hidden h-full w-full flex-col items-center justify-center">
    <div class="bg-white rounded-full w-40 h-70 blur-[400px] absolute -top-20 select-none" />
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
      <CrossedDiv line>
        <div class="px-8 py-6 flex flex-col items-center justify-center gap-4">
          <a href="/auth/github">
            <UButton
              icon="simple-icons:github"
              label="Sign in with GitHub"
              color="neutral"
            />
          </a>
          <a href="/auth/google">
            <UButton
              icon="simple-icons:google"
              label="Sign in with Google"
              color="neutral"
            />
          </a>
        </div>
      </CrossedDiv>
    </div>
  </div>
</template>
