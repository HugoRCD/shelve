<script setup lang="ts">
import { AuthType, type CreateUserInput } from '@types'

const appUrl = window.location.origin

const newUser = ref<CreateUserInput>({
  email: 'hrichard206@gmail.com',
  username: 'test',
  avatar: 'https://i.imgur.com/6VBx3io.png',
  authType: AuthType.GITHUB,
  appUrl
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
  <PageSection
    title="Test new user email"
    description="Send a test email to a new user"
    :stagger="1"
  >
    <UButton
      label="Send email"
      variant="soft"
      icon="lucide:mail"
      :loading
      class="size-fit"
      @click="testNewUserMail"
    />
  </PageSection>
</template>
