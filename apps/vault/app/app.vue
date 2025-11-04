<script setup lang="ts">
import { motion } from 'motion-v'
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'
import InfoModal from '~/components/InfoModal.vue'

const infoModal = ref<InstanceType<typeof InfoModal> | null>(null)

useHead({
  title: 'Vault by Shelve - Secure Secret Sharing Platform',
  titleTemplate: 'Vault by Shelve - Secure Secret Sharing Platform',
})

useSeoMeta({
  title: 'Vault by Shelve - Secure Secret Sharing Platform',
  description: 'Share secrets securely. No account required. Set expiration. Control access. End-to-end encrypted.',

  ogTitle: 'Vault - Share Secrets Securely',
  ogDescription: 'Share secrets securely. No account required. Set expiration. Control access. End-to-end encrypted.',
  ogImage: 'https://shelve.cloud/vault-og.png',
  ogUrl: 'https://shelve.cloud/vault',
  ogType: 'website',
  ogSiteName: 'Shelve',

  twitterTitle: 'Vault - Secure Secret Sharing',
  twitterDescription: 'Share secrets securely. No account required. Set expiration. Control access. End-to-end encrypted.',
  twitterCard: 'summary_large_image',
  twitterImage: 'https://shelve.cloud/vault-og.png',

  author: 'Hugo Richard',
})
</script>

<template>
  <Html lang="en">
    <Body class="flex h-full flex-col">
      <ShelveMeta
        :default-og-image="false"
        title="Vault by Shelve - Secure Secret Sharing Platform"
        title-template="Vault by Shelve - Secure Secret Sharing Platform"
      />
      <TechnicalPatterns />
      <ShaderOverlay />
      <UApp :tooltip="{ delayDuration: 300 }">
        <div class="absolute inset-0 mx-6 flex flex-col items-center justify-center">
          <div class="flex flex-col items-center gap-2 mb-6">
            <motion.div
              class="flex flex-col items-center"
              :initial="{
                scale: 1.1,
                opacity: 0,
                filter: 'blur(20px)'
              }"
              :animate="{
                scale: 1,
                opacity: 1,
                filter: 'blur(0px)'
              }"
              :transition="{
                duration: 0.6,
                delay: 0.1
              }"
            >
              <div class="flex items-center gap-4">
                <div class="relative">
                  <div class="blur-[15px] opacity-40">
                    <UIcon name="custom:shelve" class="size-12" />
                  </div>
                  <UIcon name="custom:shelve" class="size-12 absolute inset-0" />
                </div>
              </div>
            </motion.div>
            <motion.p
              class="text-muted text-center max-w-lg text-sm"
              :initial="{
                scale: 1.1,
                opacity: 0,
                filter: 'blur(20px)'
              }"
              :animate="{
                scale: 1,
                opacity: 1,
                filter: 'blur(0px)'
              }"
              :transition="{
                duration: 0.6,
                delay: 0.3
              }"
            >
              Share secrets securely. No account required. Set expiration. Control access. End-to-end encrypted.
              <UButton
                variant="link"
                size="xs"
                icon="lucide:info"
                class="inline-flex! p-1! h-auto! align-middle"
                :ui="{
                  leadingIcon: 'size-3'
                }"
                @click="infoModal?.open()"
              />
            </motion.p>
          </div>
          <div class="max-w-3xl w-full mx-auto">
            <NuxtPage />
          </div>
        </div>
        <InfoModal ref="infoModal" />
        <Toaster close-button position="top-center" />
      </UApp>
    </Body>
  </Html>
</template>
