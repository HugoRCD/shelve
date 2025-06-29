<script setup lang="ts">
const props = defineProps<{
  email: string
  prefilledOtp?: string
}>()

const emit = defineEmits<{
  backToEmail: []
  otpVerified: []
}>()

const otp = ref<string[]>(props.prefilledOtp ? props.prefilledOtp.split('') : [])
const loading = ref(false)

onMounted(async () => {
  if (props.prefilledOtp && props.prefilledOtp.length === 6) {
    await handleOtpComplete(props.prefilledOtp.split(''))
  }
})

async function handleOtpComplete(value: string[]) {
  if (value.length !== 6) return
  
  loading.value = true
  try {
    await $fetch('/api/auth/otp/verify', {
      method: 'POST',
      body: {
        email: props.email,
        code: value.join('')
      }
    })
    
    emit('otpVerified')
    toast.success('Login successful!')

    await reloadNuxtApp()
  } catch (error: any) {
    toast.error(error.data?.message || 'Invalid verification code')
    otp.value = []
  } finally {
    loading.value = false
  }
}

async function resendCode() {
  try {
    await $fetch('/api/auth/otp/send', {
      method: 'POST',
      body: { email: props.email }
    })
    toast.success('New verification code sent')
  } catch (error: any) {
    toast.error('Failed to resend code')
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
