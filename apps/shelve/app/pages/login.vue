<script setup lang="ts">
const { title } = useAppConfig()
const { githubEnabled, googleEnabled } = useRuntimeConfig().public

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
  <div class="mx-auto flex h-full max-w-sm flex-col items-center justify-center p-5">
    <div class="flex flex-col items-center justify-center gap-2 text-center">
      <h1 class="text-center text-3xl leading-9">
        Login to <span class="font-newsreader font-light italic">{{ title }}</span>
      </h1>
      <p class="max-w-sm text-pretty text-sm leading-5 text-tertiary">
        If you gained access to {{ title }}, you can enter your credentials here
      </p>
      <div class="mt-4 flex flex-col items-center justify-center gap-4">
        <a
          v-if="githubEnabled"
          href="/auth/github"
          class="flex items-center gap-2 rounded-md bg-neutral-200 px-5 py-1.5 text-sm text-black transition-colors duration-300 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
        >
          <UIcon name="simple-icons:github" class="size-5 fill-current" />
          <span>
            Sign in with GitHub
          </span>
        </a>
        <a
          v-if="googleEnabled"
          href="/auth/google"
          class="flex items-center gap-2 rounded-md bg-neutral-200 px-5 py-1.5 text-sm text-black transition-colors duration-300 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
        >
          <UIcon name="simple-icons:google" class="size-5 fill-current" />
          <span>
            Sign in with Google
          </span>
        </a>
      </div>
    </div>
  </div>
</template>
