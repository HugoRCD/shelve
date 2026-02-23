<script setup lang="ts">
const props = defineProps<{
  email: string
  prefilledOtp?: string
  redirectUrl?: string
}>()

const emit = defineEmits<{
  backToEmail: []
  otpVerified: []
}>()

const router = useRouter()
const otp = ref<string[]>(props.prefilledOtp ? props.prefilledOtp.split('') : [])
const signInEmailOtp = useSignIn('emailOtp')
const sendVerificationOtp = useAuthClientAction((authClient) => authClient.emailOtp.sendVerificationOtp)
const loading = computed(() => signInEmailOtp.status.value === 'pending' || sendVerificationOtp.status.value === 'pending')

onMounted(async () => {
  if (props.prefilledOtp && props.prefilledOtp.length === 6) {
    await handleOtpComplete(props.prefilledOtp.split(''))
  }
})

async function handleOtpComplete(value: string[]) {
  if (value.length !== 6) return

  await signInEmailOtp.execute({
    email: props.email,
    otp: value.join('')
  }, {
    onSuccess: async () => {
      emit('otpVerified')
      toast.success('Login successful!')
      if (props.redirectUrl) {
        await router.push(props.redirectUrl)
      } else {
        await reloadNuxtApp()
      }
    }
  })

  if (signInEmailOtp.status.value === 'error') {
    toast.error(getAuthErrorMessage(signInEmailOtp.error.value, 'Invalid verification code'))
    otp.value = []
  }
}

async function resendCode() {
  await sendVerificationOtp.execute({
    email: props.email,
    type: 'sign-in'
  })

  if (sendVerificationOtp.status.value === 'error') {
    toast.error(getAuthErrorMessage(sendVerificationOtp.error.value, 'Failed to resend code'))
  } else {
    toast.success('New verification code sent')
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="text-center">
      <h3 class="text-lg font-medium text-highlighted">
        Enter verification code
      </h3>
      <p class="text-muted text-sm mt-1">
        We sent a 6-digit code to {{ email }}
      </p>
    </div>

    <div class="flex justify-center">
      <UPinInput
        v-model="otp"
        :length="6"
        type="number"
        size="lg"
        otp
        :disabled="loading"
        @complete="handleOtpComplete"
      />
    </div>

    <div class="space-y-3">
      <div class="text-center">
        <UButton
          variant="link"
          size="sm"
          :disabled="loading"
          @click="resendCode"
        >
          Didn't receive the code? Resend
        </UButton>
      </div>

      <UButton
        variant="outline"
        size="lg"
        block
        :disabled="loading"
        class="rounded-none"
        @click="emit('backToEmail')"
      >
        Use different email
      </UButton>
    </div>
  </div>
</template>
