<script setup lang="ts">
import { motion } from 'motion-v'

const { title } = useAppConfig()

const {data} = useFetch("/api/features")

definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

const route = useRoute()
const showOtp = ref(false)
const focus = ref(false)
const email = ref(route.query.email as string || '')
const prefilledOtp = ref(route.query.otp as string || '')
const authMode = ref<'oauth' | 'email'>('oauth')

if (email.value && prefilledOtp.value) {
  authMode.value = 'email'
  showOtp.value = true
}

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

if (route.query.error === 'invalid-otp') {
  toast.error('Invalid or expired verification code. Please try again.', {
    duration: Infinity,
    closeButton: false,
    action: {
      label: 'Dismiss',
      onClick: () => useRouter().push('/login')
    }
  })
  authMode.value = 'email'
  showOtp.value = true
}

if (route.query.error === 'otp-verification') {
  toast.error('Verification failed. Please try again.', {
    duration: Infinity,
    closeButton: false,
    action: {
      label: 'Dismiss',
      onClick: () => useRouter().push('/login')
    }
  })
  authMode.value = 'email'
}

function handleEmailSubmitted(submittedEmail: string) {
  email.value = submittedEmail
  showOtp.value = true
}

function handleBackToEmail() {
  showOtp.value = false
  email.value = ''
  prefilledOtp.value = ''
  const router = useRouter()
  router.replace({ query: {} })
}

function handleOtpVerified() {
  const router = useRouter()
  router.replace({ query: {} })
}

useSeoMeta({
  title: 'Login',
  titleTemplate: '%s - Shelve'
})
</script>

<template>
  <div class="flex overflow-hidden size-full flex-col items-center justify-center">
    <div class="dark:bg-inverted rounded-full w-50 h-96 blur-[250px] absolute -top-40 select-none" />
    <div class="mx-auto w-full flex flex-col items-center justify-center gap-2 text-center">
      <Logo :text="false" size="size-10" />
      <div class="flex flex-col items-center gap-1">
        <h1 class="text-center text-3xl leading-9 main-gradient">
          Sign in to {{ title }}
        </h1>
        <p class="text-muted italic">
          Welcome to the future of environment management.
        </p>
      </div>
    </div>
    <div class="relative mt-6">
      <CrossedDiv line @mouseover="focus = true" @mouseleave="focus = false">
        <motion.div
          class="flex flex-col items-center justify-center gap-4 overflow-hidden p-6 sm:p-10 min-w-xs sm:min-w-md"
          style="will-change: transform"
        >
          <!-- OAuth Buttons -->
          <motion.div
            v-if="authMode === 'oauth'"
            class="flex flex-col gap-3 w-full"
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :exit="{ opacity: 0, y: -20 }"
            :transition="{ duration: 0.3 }"
          >
            <AuthButton v-if="data?.isGithubEnabled" icon="simple-icons:github" label="Sign in with GitHub" provider="github" />
            <AuthButton v-if="data?.isGoogleEnabled" icon="simple-icons:google" label="Sign in with Google" provider="google" />

            <motion.div
              v-if="data?.isEmailEnabled && (data?.isGithubEnabled || data?.isGoogleEnabled)"
              class="flex items-center gap-3 my-2"
              :initial="{ opacity: 0, scaleX: 0 }"
              :animate="{ opacity: 1, scaleX: 1 }"
              :transition="{ delay: 0.2, duration: 0.4 }"
            >
              <div class="flex-1 h-px bg-accented" />
              <span class="text-xs text-muted">or</span>
              <div class="flex-1 h-px bg-accented" />
            </motion.div>

            <UButton
              v-if="data?.isEmailEnabled"
              variant="outline"
              size="lg"
              icon="heroicons:envelope"
              class="rounded-none"
              block
              label="Continue with Email"
              @click="authMode = 'email'"
            />
          </motion.div>

          <!-- Email/OTP Form -->
          <motion.div
            v-else-if="authMode === 'email'"
            class="w-full space-y-4"
            :initial="{ opacity: 0, x: 20 }"
            :animate="{ opacity: 1, x: 0 }"
            :exit="{ opacity: 0, x: -20 }"
            :transition="{ duration: 0.3 }"
          >
            <motion.div
              v-if="!showOtp"
              :initial="{ opacity: 0, y: 10 }"
              :animate="{ opacity: 1, y: 0 }"
              :exit="{ opacity: 0, y: -10 }"
              :transition="{ duration: 0.2 }"
            >
              <AuthEmailForm @email-submitted="handleEmailSubmitted" />
              <div class="mt-4 text-center">
                <UButton
                  variant="link"
                  size="sm"
                  icon="heroicons:arrow-left"
                  label="Back to social login"
                  @click="authMode = 'oauth'"
                />
              </div>
            </motion.div>

            <motion.div
              v-else
              :initial="{ opacity: 0, y: 10 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ duration: 0.3, delay: 0.1 }"
            >
              <AuthOtpForm
                :email
                :prefilled-otp
                @back-to-email="handleBackToEmail"
                @otp-verified="handleOtpVerified"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </CrossedDiv>
    </div>
  </div>
</template>
