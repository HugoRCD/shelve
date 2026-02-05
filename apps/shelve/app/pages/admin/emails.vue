<script setup lang="ts">
import { AuthType, type CreateUserInput, TeamRole } from '@types'

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

const invitationTest = ref({
  email: 'hrichard206@gmail.com',
  teamName: 'Acme Corp',
  inviterName: 'Hugo',
  role: TeamRole.MEMBER,
})
const invitationLoading = ref(false)

async function testInvitationMail() {
  invitationLoading.value = true
  try {
    await $fetch('/api/mail/invitation', {
      method: 'POST',
      body: {
        email: invitationTest.value.email,
        teamName: invitationTest.value.teamName,
        inviterName: invitationTest.value.inviterName,
        role: invitationTest.value.role,
      },
    })
    toast.success('Invitation email sent')
  } catch (error) {
    toast.error('Failed to send invitation email')
  }
  invitationLoading.value = false
}

const otpTest = ref({
  email: 'hrichard206@gmail.com',
  otp: '123456',
})
const otpLoading = ref(false)

async function testOtpMail() {
  otpLoading.value = true
  try {
    await $fetch('/api/mail/otp', {
      method: 'POST',
      body: {
        email: otpTest.value.email,
        otp: otpTest.value.otp,
      },
    })
    toast.success('OTP email sent')
  } catch (error) {
    toast.error('Failed to send OTP email')
  }
  otpLoading.value = false
}

useSeoMeta({
  title: 'Email Tests',
})
</script>

<template>
  <div class="space-y-8">
    <PageSection
      title="Test new user email"
      description="Send a test email to a new user"
    >
      <div class="flex flex-col gap-4">
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Email">
            <UInput v-model="newUser.email" placeholder="recipient@example.com" />
          </UFormField>
          <UFormField label="Username">
            <UInput v-model="newUser.username" placeholder="username" />
          </UFormField>
        </div>
        <UButton
          label="Send email"
          variant="soft"
          icon="lucide:mail"
          :loading
          class="size-fit"
          @click="testNewUserMail"
        />
      </div>
    </PageSection>

    <PageSection
      title="Test invitation email"
      description="Send a test invitation email"
    >
      <div class="flex flex-col gap-4">
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Email">
            <UInput v-model="invitationTest.email" placeholder="recipient@example.com" />
          </UFormField>
          <UFormField label="Team Name">
            <UInput v-model="invitationTest.teamName" placeholder="Acme Corp" />
          </UFormField>
          <UFormField label="Inviter Name">
            <UInput v-model="invitationTest.inviterName" placeholder="Hugo" />
          </UFormField>
          <UFormField label="Role">
            <USelect
              v-model="invitationTest.role"
              :items="[
                { label: 'Member', value: TeamRole.MEMBER },
                { label: 'Admin', value: TeamRole.ADMIN },
                { label: 'Owner', value: TeamRole.OWNER },
              ]"
              value-attribute="value"
              option-attribute="label"
            />
          </UFormField>
        </div>
        <UButton
          label="Send invitation email"
          variant="soft"
          icon="lucide:mail"
          :loading="invitationLoading"
          class="size-fit"
          @click="testInvitationMail"
        />
      </div>
    </PageSection>

    <PageSection
      title="Test OTP email"
      description="Send a test OTP verification email"
    >
      <div class="flex flex-col gap-4">
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Email">
            <UInput v-model="otpTest.email" placeholder="recipient@example.com" />
          </UFormField>
          <UFormField label="OTP Code">
            <UInput v-model="otpTest.otp" placeholder="123456" maxlength="6" />
          </UFormField>
        </div>
        <UButton
          label="Send OTP email"
          variant="soft"
          icon="lucide:mail"
          :loading="otpLoading"
          class="size-fit"
          @click="testOtpMail"
        />
      </div>
    </PageSection>
  </div>
</template>
