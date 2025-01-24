<script setup lang="ts">
import { AuthType, type CreateUserInput } from '~~/types'

const newUser = ref<CreateUserInput>({
  email: 'hrichard206@gmail.com',
  username: 'test',
  avatar: 'https://i.imgur.com/6VBx3io.png',
  authType: AuthType.GITHUB,
})
const loading = ref(false)

async function testNewUserMail() {
  loading.value = true
  try {
    await $fetch('/api/mail/welcome', {
      method: 'POST',
      body: {
        email: newUser.value.email,
        username: newUser.value.username,
      },
    })
    toast.success('Email sent')
  } catch (error) {
    toast.error('Failed to send email')
  }
  loading.value = false
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-4">
      <h2 class="text-lg font-semibold">
        Test new user email
      </h2>
      <p class="text-sm text-neutral-500 dark:text-neutral-400">
        Send a test email to a new user
      </p>
      <div>
        <UButton
          label="Send email"
          variant="soft"
          icon="lucide:mail"
          :loading
          @click="testNewUserMail"
        />
      </div>
    </div>
  </div>
</template>
