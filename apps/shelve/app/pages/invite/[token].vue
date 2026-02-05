<script setup lang="ts">
import { motion } from 'motion-v'
import { InvitationStatus, TeamRole } from '@types'

definePageMeta({
  layout: 'auth',
})

const route = useRoute()
const router = useRouter()
const token = route.params.token as string

const { loggedIn, user } = useUserSession()
const { title, auth: { isGithubEnabled, isGoogleEnabled, isEmailEnabled } } = useAppConfig()

const { data: invitation, status, error } = await useFetch(`/api/invitations/${token}`, {
  key: `invitation-${token}`,
})

const accepting = ref(false)
const declining = ref(false)

const isExpired = computed(() => {
  if (!invitation.value) return false
  return invitation.value.status === InvitationStatus.EXPIRED ||
    new Date(invitation.value.expiresAt) < new Date()
})

const isAlreadyUsed = computed(() => {
  if (!invitation.value) return false
  return invitation.value.status !== InvitationStatus.PENDING
})

const emailMismatch = computed(() => {
  if (!loggedIn.value || !user.value || !invitation.value) return false
  return user.value.email.toLowerCase() !== invitation.value.email.toLowerCase()
})

const roleLabel = computed(() => {
  if (!invitation.value) return ''
  switch (invitation.value.role) {
    case TeamRole.OWNER:
      return 'Owner'
    case TeamRole.ADMIN:
      return 'Admin'
    case TeamRole.MEMBER:
      return 'Member'
    default:
      return invitation.value.role
  }
})

async function acceptInvitation() {
  accepting.value = true
  try {
    const result = await $fetch(`/api/invitations/${token}/accept`, {
      method: 'POST',
    })

    await useUserSession().fetch()

    toast.success('Invitation accepted! Welcome to the team.')
    if (result.teamSlug) {
      await router.push(`/${result.teamSlug}`)
    } else {
      await router.push('/')
    }
  } catch (err: any) {
    toast.error(err.data?.message || 'Failed to accept invitation')
  } finally {
    accepting.value = false
  }
}

async function declineInvitation() {
  declining.value = true
  try {
    await $fetch(`/api/invitations/${token}/decline`, {
      method: 'POST',
    })
    toast.success('Invitation declined')
    await router.push('/login')
  } catch (err: any) {
    toast.error(err.data?.message || 'Failed to decline invitation')
  } finally {
    declining.value = false
  }
}

function loginWithRedirect(provider: string) {
  const redirect = `/invite/${token}`
  window.location.href = `/auth/${provider}?redirect=${encodeURIComponent(redirect)}`
}

async function logoutAndRedirect() {
  await useUserSession().clear()
  const redirect = `/invite/${token}`
  await navigateTo(`/login?redirect=${encodeURIComponent(redirect)}`)
}

useSeoMeta({
  title: invitation.value?.team?.name ? `Join ${invitation.value.team.name}` : 'Team Invitation',
  titleTemplate: '%s - Shelve'
})
</script>

<template>
  <div class="flex overflow-hidden size-full flex-col items-center justify-center">
    <div class="dark:bg-inverted rounded-full w-50 h-96 blur-[250px] absolute -top-40 select-none" />
    <div class="mx-auto w-full flex flex-col items-center justify-center gap-2 text-center">
      <Logo :text="false" size="size-10" />
    </div>

    <div class="relative mt-6">
      <CrossedDiv line>
        <motion.div
          class="flex flex-col items-center justify-center gap-4 overflow-hidden p-6 sm:p-8 w-full max-w-lg"
          style="will-change: transform"
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.3 }"
        >
          <div v-if="status === 'pending'" class="flex flex-col items-center gap-4">
            <UIcon name="heroicons:arrow-path" class="size-8 animate-spin text-muted" />
            <p class="text-muted">
              Loading invitation...
            </p>
          </div>

          <div v-else-if="error" class="flex flex-col items-center gap-4 text-center">
            <UIcon name="heroicons:exclamation-circle" class="size-12 text-error" />
            <h2 class="text-xl font-semibold text-highlighted">
              Invitation Not Found
            </h2>
            <p class="text-muted">
              This invitation link is invalid or has been removed.
            </p>
            <UButton to="/login" variant="outline" label="Go to Login" />
          </div>

          <div v-else-if="isExpired" class="flex flex-col items-center gap-4 text-center">
            <UIcon name="heroicons:clock" class="size-12 text-warning" />
            <h2 class="text-xl font-semibold text-highlighted">
              Invitation Expired
            </h2>
            <p class="text-muted">
              This invitation has expired. Please ask the team admin to send a new invitation.
            </p>
            <UButton to="/login" variant="outline" label="Go to Login" />
          </div>

          <div v-else-if="isAlreadyUsed" class="flex flex-col items-center gap-4 text-center">
            <UIcon name="heroicons:check-circle" class="size-12 text-success" />
            <h2 class="text-xl font-semibold text-highlighted">
              Invitation Already Used
            </h2>
            <p class="text-muted">
              This invitation has already been {{ invitation?.status }}.
            </p>
            <UButton to="/" variant="outline" label="Go to Dashboard" />
          </div>

          <template v-else-if="invitation">
            <div class="flex flex-col items-center gap-3">
              <UAvatar
                v-if="invitation.team?.logo"
                :src="invitation.team.logo"
                :alt="invitation.team.name"
                size="xl"
                img-class="object-cover"
              />
              <h2 class="text-2xl font-bold text-highlighted">
                Join {{ invitation.team?.name }}
              </h2>
              <p class="text-muted text-center">
                <template v-if="invitation.invitedBy">
                  <strong>{{ invitation.invitedBy.username }}</strong> has invited you to join as a
                </template>
                <template v-else>
                  You've been invited to join as a
                </template>
                <UBadge :label="roleLabel" variant="subtle" class="ml-1" />
              </p>
            </div>

            <p v-if="emailMismatch" class="text-sm text-muted text-center">
              <UIcon name="heroicons:information-circle" class="size-4 inline-block mr-1 align-text-bottom" />
              This invitation was sent to <span class="text-highlighted">{{ invitation.email }}</span>.
              You're logged in as <span class="text-highlighted">{{ user?.email }}</span>.
            </p>

            <div v-if="loggedIn && !emailMismatch" class="flex flex-col gap-3 w-full mt-4">
              <UButton
                block
                size="lg"
                :loading="accepting"
                :disabled="declining"
                label="Accept Invitation"
                @click="acceptInvitation"
              />
              <UButton
                block
                size="lg"
                variant="outline"
                color="neutral"
                :loading="declining"
                :disabled="accepting"
                label="Decline"
                @click="declineInvitation"
              />
            </div>

            <div v-else-if="loggedIn && emailMismatch" class="flex flex-col gap-3 w-full mt-4">
              <p class="text-sm text-muted text-center">
                Please log in with the correct email address to accept this invitation.
              </p>
              <UButton
                block
                variant="outline"
                label="Log out and switch account"
                @click="logoutAndRedirect"
              />
            </div>

            <div v-else class="flex flex-col gap-3 w-full mt-4">
              <p class="text-sm text-muted text-center mb-2">
                Sign in or create an account to accept this invitation
              </p>

              <UButton
                v-if="isGithubEnabled"
                block
                icon="simple-icons:github"
                label="Continue with GitHub"
                @click="loginWithRedirect('github')"
              />
              <UButton
                v-if="isGoogleEnabled"
                block
                icon="simple-icons:google"
                label="Continue with Google"
                @click="loginWithRedirect('google')"
              />

              <div v-if="isEmailEnabled && (isGithubEnabled || isGoogleEnabled)" class="flex items-center gap-3 my-2">
                <div class="flex-1 h-px bg-accented" />
                <span class="text-xs text-muted">or</span>
                <div class="flex-1 h-px bg-accented" />
              </div>

              <UButton
                v-if="isEmailEnabled"
                block
                variant="outline"
                icon="heroicons:envelope"
                label="Continue with Email"
                :to="`/login?redirect=${encodeURIComponent(`/invite/${token}`)}`"
              />
            </div>
          </template>
        </motion.div>
      </CrossedDiv>
    </div>
  </div>
</template>
