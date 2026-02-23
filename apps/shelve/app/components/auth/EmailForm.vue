<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const emit = defineEmits<{
  emailSubmitted: [email: string]
}>()

const schema = z.object({
  email: z.email('Please enter a valid email address')
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  email: undefined
})

const sendVerificationOtp = useAuthClientAction((authClient) => authClient.emailOtp.sendVerificationOtp)
const loading = computed(() => sendVerificationOtp.status.value === 'pending')

async function onSubmit(event: FormSubmitEvent<Schema>) {
  await sendVerificationOtp.execute({
    email: event.data.email,
    type: 'sign-in'
  })

  if (sendVerificationOtp.status.value === 'error') {
    toast.error(getAuthErrorMessage(sendVerificationOtp.error.value, 'Failed to send verification code'))
  } else {
    emit('emailSubmitted', event.data.email)
    toast.success('Check your email for the verification code')
  }
}
</script>

<template>
  <UForm :schema :state class="space-y-4" @submit="onSubmit">
    <UFormField label="Email address" name="email">
      <UInput
        v-model="state.email"
        type="email"
        placeholder="Enter your email address"
        size="lg"
        :disabled="loading"
        :ui="{
          root: 'w-full',
          base: 'rounded-none w-full'
        }"
      />
    </UFormField>

    <UButton
      type="submit"
      :loading
      :disabled="loading"
      size="lg"
      block
      class="rounded-none"
      label="Send verification code"
    />
  </UForm>
</template>
