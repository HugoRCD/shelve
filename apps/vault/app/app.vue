<script setup lang="ts">
import { Toaster } from 'vue-sonner'

useHead({
  title: 'Vault by Shelve - Secure Secret Sharing Platform',
  titleTemplate: 'Vault by Shelve - Secure Secret Sharing Platform',
})

useSeoMeta({
  title: 'Vault by Shelve - Secure Secret Sharing Platform',
  description: 'Share sensitive data and environment variables securely without an account. Set expiration time, control number of reads, and ensure encrypted transmission.',

  ogTitle: 'Vault by Shelve - Share Secrets Securely',
  ogDescription: 'Securely share sensitive data with customizable expiration and read limits. No account needed.',
  ogImage: 'https://shelve.cloud/vault-og.png',
  ogUrl: 'https://shelve.cloud/vault',
  ogType: 'website',
  ogSiteName: 'Shelve',

  twitterTitle: 'Vault by Shelve - Secure Secret Sharing',
  twitterDescription: 'Share sensitive data securely with expiration time and read limits.',
  twitterCard: 'summary_large_image',
  twitterImage: 'https://shelve.cloud/vault-og.png',

  author: 'Hugo Richard',
})

const route = useRoute()
const id = computed(() => route.query.id)

const sealMode = computed(() => id.value)

const items = [
  {
    label: 'What is Vault by Shelve?',
    icon: 'lucide:shield-check',
    content: 'Vault by Shelve allows you to securely send secrets to anyone, anywhere. Once you create a Vault, you\'ll receive a link to share with anyone you\'d like.',
  },
  {
    label: 'Is Vault by Shelve is secure?',
    icon: 'lucide:shield',
    content: 'Yes, Vault by Shelve is secure. We use industry-standard encryption (AES-256) to protect your data. We never store your secrets in plain text, and we never share your data with third parties. You can also check the source code on GitHub to verify our security practices.',
  },
  {
    label: 'How can I contact the Shelve team?',
    icon: 'lucide:mail',
    content: 'For the moment you can send me an email at contact@shelve.cloud',
  }
]
</script>

<template>
  <Html lang="en">
    <Body class="flex h-full flex-col">
      <ShelveMeta
        :default-og-image="false"
        title="Vault by Shelve - Secure Secret Sharing Platform"
        title-template="Vault by Shelve - Secure Secret Sharing Platform"
      />
      <UApp>
        <div class="flex flex-col items-center justify-center py-4 sm:py-20">
          <div class="w-full border-y border-neutral-500/20">
            <div class="mx-auto flex max-w-2xl justify-center px-5 sm:px-0">
              <EncryptDiv encrypted-text class="w-full border-x border-neutral-500/20">
                <div>
                  <h1 class="main-gradient cursor-pointer text-3xl">
                    <ScrambleText label="Vault" />
                  </h1>
                  <p class="text-neutral-500">
                    Vault is a small utility to share secrets.
                  </p>
                </div>
              </EncryptDiv>
            </div>
          </div>
          <Encrypt v-if="!sealMode" />
          <Decrypt v-else />
        </div>
        <div class="mt-8 max-w-2xl flex w-full mx-auto flex-col gap-4 px-5">
          <div class="flex flex-col items-center justify-center">
            <h3 class="main-gradient text-2xl">
              <ScrambleText label="FAQ" />
            </h3>
            <p class="max-w-lg text-center text-sm text-neutral-500 sm:text-base">
              Frequently asked questions about Vault.
            </p>
          </div>
          <UAccordion
            variant="ghost"
            size="sm"
            :items
          />
        </div>
        <footer class="mt-15 flex w-full mx-auto max-w-2xl flex-col gap-4 px-5">
          <USeparator />
          <div class="flex max-w-2xl items-center justify-between">
            <span class="text-xs font-mono italic tracking-tight text-neutral-500">
              © {{ new Date().getFullYear() }} - Made by <NuxtLink to="https://hrcd.fr/" class="text-neutral-400 hover:text-neutral-200">
                HugoRCD
              </NuxtLink>
            </span>
            <span class="text-xs font-mono italic tracking-tight text-neutral-500">
              <NuxtLink to="https://dub.sh/shelve" target="_blank" class="text-neutral-400 hover:text-neutral-200">
                Powered by Shelve <UIcon name="custom:shelve" />
              </NuxtLink>
            </span>
          </div>
        </footer>
        <Toaster close-button position="top-center" />
      </UApp>
    </Body>
  </Html>
</template>
