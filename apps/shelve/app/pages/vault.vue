<script setup lang="ts">
useHead({
  title: 'Vault by Shelve - Secure Secret Sharing Platform',
  titleTemplate: 'Vault by Shelve - Secure Secret Sharing Platform',
})

useSeoMeta({
  title: 'Vault by Shelve - Secure Secret Sharing Platform',
  description: 'Share sensitive data and environment variables securely without an account. Set expiration time, control number of reads, and ensure encrypted transmission.',

  ogTitle: 'Vault by Shelve - Share Secrets Securely',
  ogDescription: 'Securely share sensitive data with customizable expiration and read limits. No account needed.',
  ogImage: 'https://shelve.hrcd.fr/vault-social-preview.jpg',
  ogUrl: 'https://shelve.hrcd.fr/vault',
  ogType: 'website',
  ogSiteName: 'Shelve',

  twitterTitle: 'Vault by Shelve - Secure Secret Sharing',
  twitterDescription: 'Share sensitive data securely with expiration time and read limits.',
  twitterCard: 'summary_large_image',
  twitterImage: 'https://shelve.hrcd.fr/vault-social-preview.jpg',

  author: 'Hugo Richard',
})

const route = useRoute()
const id = computed(() => route.query.id)

const sealMode = computed(() => id.value)
</script>

<template>
  <div class="mx-auto my-8 flex h-full flex-col items-center justify-around gap-2 sm:my-0">
    <div class="flex w-full flex-col items-center justify-center">
      <div class="w-full border-y border-neutral-500/20">
        <div class="mx-auto flex max-w-2xl justify-center px-5 sm:px-0">
          <CrossedDiv encrypted-text class="w-full">
            <div>
              <h1 class="main-gradient cursor-pointer text-3xl" @click="$router.push('/vault')">
                <LandingScrambleText label="Vault" />
              </h1>
              <p class="text-neutral-500">
                Vault is a small utility to share secrets.
              </p>
            </div>
          </CrossedDiv>
        </div>
      </div>
      <VaultEncrypt v-if="!sealMode" />
      <VaultDecrypt v-else />
    </div>
    <VaultFaq />
  </div>
</template>
