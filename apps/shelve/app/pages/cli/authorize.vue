<script setup lang="ts">
import { motion } from 'motion-v'

type CliDeviceClientMeta = {
  hostname?: string
  platform?: string
  cliVersion?: string
}

definePageMeta({
  layout: 'auth',
})

const route = useRoute()
const { loggedIn, user, fetch: fetchSession } = useUserSession()
const { title, auth: { isGithubEnabled, isGoogleEnabled, isEmailEnabled } } = useAppConfig()

const userCode = computed(() => {
  const raw = (route.query.user_code as string) || ''
  return raw.trim().toUpperCase().replace(/\s+/g, '')
})

const redirectPath = computed(() => route.fullPath)

const approving = ref(false)
const denying = ref(false)
const done = ref<'approved' | 'denied' | null>(null)

const { data: deviceStatus, status: fetchStatus, error, refresh } = await useFetch(
  () => `/api/auth/device?user_code=${encodeURIComponent(userCode.value)}`,
  {
    key: () => `cli-device-${userCode.value}`,
    immediate: !!userCode.value,
    watch: [userCode],
  },
)

const clientMeta = computed<CliDeviceClientMeta>(() => deviceStatus.value?.clientMeta ?? {})

const deviceLabel = computed(() => {
  const parts: string[] = []
  if (clientMeta.value.hostname) parts.push(clientMeta.value.hostname)
  if (clientMeta.value.platform) parts.push(clientMeta.value.platform)
  if (clientMeta.value.cliVersion) parts.push(`CLI ${clientMeta.value.cliVersion}`)
  return parts.length ? parts.join(' · ') : 'Unknown device'
})

const requestPending = computed(() => deviceStatus.value?.status === 'pending')
const isInvalid = computed(() =>
  !!userCode.value
  && fetchStatus.value === 'success'
  && deviceStatus.value
  && deviceStatus.value.status !== 'pending',
)

async function approve() {
  if (!userCode.value) return
  approving.value = true
  try {
    await $fetch('/api/auth/device/approve', {
      method: 'POST',
      body: { user_code: userCode.value },
    })
    await fetchSession()
    done.value = 'approved'
    toast.success('CLI authorized. You can close this tab.')
  } catch (err: any) {
    toast.error(err.data?.statusMessage || err.data?.message || 'Authorization failed')
    await refresh()
  } finally {
    approving.value = false
  }
}

async function deny() {
  if (!userCode.value) return
  denying.value = true
  try {
    await $fetch('/api/auth/device/deny', {
      method: 'POST',
      body: { user_code: userCode.value },
    })
    done.value = 'denied'
    toast.info('CLI authorization denied.')
  } catch (err: any) {
    toast.error(err.data?.statusMessage || err.data?.message || 'Could not deny request')
  } finally {
    denying.value = false
  }
}

useSeoMeta({
  title: 'Authorize CLI',
  titleTemplate: '%s - Shelve',
})
</script>

<template>
  <div class="flex overflow-hidden size-full flex-col items-center justify-center">
    <div class="dark:bg-inverted rounded-full w-50 h-96 blur-[250px] absolute -top-40 select-none" />
    <div class="mx-auto w-full flex flex-col items-center justify-center gap-2 text-center">
      <Logo :text="false" size="size-10" />
      <div class="flex flex-col items-center gap-1">
        <h1 class="text-center text-3xl leading-9 main-gradient">
          Authorize Shelve CLI
        </h1>
        <p class="text-muted italic max-w-md">
          <template v-if="done === 'approved'">
            You can close this tab and return to your terminal.
          </template>
          <template v-else-if="done === 'denied'">
            The CLI login was cancelled.
          </template>
          <template v-else-if="loggedIn">
            Confirm access for the machine below.
          </template>
          <template v-else>
            Sign in to connect your terminal to {{ title }}.
          </template>
        </p>
        <p
          v-if="userCode && !done"
          class="mt-3 font-mono text-base sm:text-lg tracking-[0.35em] text-highlighted tabular-nums"
        >
          {{ userCode }}
        </p>
      </div>
    </div>

    <div class="relative mt-6">
      <CrossedDiv line>
        <motion.div
          class="flex flex-col items-center justify-center gap-4 overflow-hidden p-6 sm:p-10 min-w-xs sm:min-w-md"
          style="will-change: transform"
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
        >
          <div v-if="!userCode" class="text-center space-y-3">
            <p class="text-muted text-sm">
              Missing authorization code. Run <code class="text-xs">shelve login</code> again from your terminal.
            </p>
          </div>

          <div v-else-if="done === 'approved'" class="text-center space-y-3">
            <UIcon name="heroicons:check-circle" class="size-12 text-success mx-auto" />
            <p class="font-medium">
              CLI authorized
            </p>
            <p class="text-muted text-sm">
              Return to your terminal — login should complete automatically. You can close this tab.
            </p>
          </div>

          <div v-else-if="done === 'denied'" class="text-center space-y-3">
            <p class="text-muted text-sm">
              Authorization was denied. The CLI login was cancelled.
            </p>
          </div>

          <div v-else-if="!loggedIn" class="flex flex-col gap-3 w-full">
            <AuthButton
              v-if="isGithubEnabled"
              icon="simple-icons:github"
              label="Sign in with GitHub"
              provider="github"
              :redirect-url="redirectPath"
            />
            <AuthButton
              v-if="isGoogleEnabled"
              icon="simple-icons:google"
              label="Sign in with Google"
              provider="google"
              :redirect-url="redirectPath"
            />
            <UButton
              v-if="isEmailEnabled"
              variant="outline"
              size="lg"
              icon="heroicons:envelope"
              class="rounded-none"
              block
              label="Continue with Email"
              :to="`/login?redirect=${encodeURIComponent(redirectPath)}`"
            />
          </div>

          <div v-else-if="fetchStatus === 'error'" class="text-center text-sm text-error">
            Could not load authorization request.
          </div>

          <div v-else-if="fetchStatus === 'pending'" class="text-center text-sm text-muted">
            Loading authorization request…
          </div>

          <div v-else-if="isInvalid" class="text-center space-y-2">
            <p class="text-muted text-sm">
              This authorization request is no longer valid. Run <code class="text-xs">shelve login</code> again.
            </p>
          </div>

          <div v-else-if="requestPending" class="w-full space-y-5">
            <div class="rounded-lg border border-default p-4 space-y-2 text-left">
              <p class="text-xs text-muted uppercase tracking-wide">
                Device
              </p>
              <p class="font-medium">
                {{ deviceLabel }}
              </p>
              <p v-if="user" class="text-sm text-muted">
                Signed in as {{ user.email }}
              </p>
            </div>

            <p class="text-xs text-muted text-center">
              Grants a revocable CLI token (read & write, 90-day expiry).
            </p>

            <div class="flex flex-col gap-2">
              <UButton
                block
                size="lg"
                class="rounded-none"
                label="Authorize CLI"
                :loading="approving"
                :disabled="denying"
                @click="approve"
              />
              <UButton
                block
                size="lg"
                variant="outline"
                color="neutral"
                class="rounded-none"
                label="Deny"
                :loading="denying"
                :disabled="approving"
                @click="deny"
              />
            </div>
          </div>
        </motion.div>
      </CrossedDiv>
    </div>
  </div>
</template>
