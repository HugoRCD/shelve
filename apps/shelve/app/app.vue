<script setup lang="ts">
import { Toaster } from 'vue-sonner'

function setPrefersReducedMotion(reduceMotion: boolean) {
  if (reduceMotion) {
    document.documentElement.setAttribute('data-reduce-motion', 'reduce')
  } else {
    document.documentElement.removeAttribute('data-reduce-motion')
  }
}

const reduceMotion = useCookie<boolean>('reduceMotion', {
  watch: true,
})

if (import.meta.client) setPrefersReducedMotion(reduceMotion.value)

const { fetchTeams } = useTeamsService()

defineShortcuts({
  'p': () => {
    navigateTo('/')
  },
  'm': () => {
    navigateTo('/members')
  },
  't': () => {
    navigateTo('/tokens')
  },
  's': () => {
    navigateTo('/settings')
  },
})

const { loggedIn } = useUserSession()
const teams = useTeams()

if (loggedIn.value && teams.value.length === 0)
  await fetchTeams()
</script>

<template>
  <Html lang="en">
    <Body class="overscroll-y-none selection:bg-primary font-geist relative overflow-x-hidden bg-white text-black selection:text-inverted dark:bg-neutral-950 dark:text-white">
      <ShelveMeta />
      <UApp :tooltip="{ delayDuration: 0 }">
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
        <Toaster
          close-button
          position="top-center"
        />
      </UApp>
    </Body>
  </Html>
</template>
