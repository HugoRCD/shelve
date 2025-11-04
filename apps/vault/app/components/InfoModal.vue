<script setup lang="ts">
const isOpen = ref(false)

const faqItems = [
  {
    label: 'What is Vault?',
    icon: 'lucide:shield-check',
    content: 'Vault is a secure way to share sensitive information like API keys, passwords, and environment variables with anyone, anywhere. Create a shareable link, set access limits, and we handle the rest. Everything is encrypted end-to-end, so only you and your recipient can access it.',
  },
  {
    label: 'How secure is Vault?',
    icon: 'lucide:shield',
    content: 'Extremely secure. We use AES-256 encryption, the same standard used by banks and governments. Your secrets are encrypted before leaving your browser and can only be decrypted with the link and optionally a password you choose. We never see your data in plain text. Ever. You can verify our security practices by inspecting our open-source code.',
  },
  {
    label: 'How does it work?',
    icon: 'lucide:zap',
    content: 'Paste your secret, choose how many times it can be read and when it expires. We generate a unique link you can share safely. The recipient opens the link, enters an optional password if you set one, and gets your secret. Once the read limit or expiration is reached, the secret is permanently deleted.',
  },
  {
    label: 'What happens to my data?',
    icon: 'lucide:lock',
    content: 'Your secrets are encrypted and stored temporarily. Once accessed the maximum number of times or after expiration, they\'re permanently deleted from our servers. We don\'t log, track, or analyze your data. Privacy isn\'t optional, it\'s built in.',
  },
  {
    label: 'Can I use Vault for free?',
    icon: 'lucide:gift',
    content: 'Yes. Vault is free to use, no account, no credit card, no limits. Share as many secrets as you need, whenever you need. Built for developers, by developers.',
  },
  {
    label: 'What if I lose the link?',
    icon: 'lucide:help-circle',
    content: 'If you lose the link, you\'ll need to create a new secret. We can\'t recover links for security reasons. This ensures that even we can\'t access your secrets without the link. Always save important links or share them immediately.',
  },
  {
    label: 'Can I track who accessed my secret?',
    icon: 'lucide:eye',
    content: 'No. For privacy reasons, we don\'t track who accesses your secrets. You can see how many reads are remaining, but not who accessed them or when. This protects both you and your recipients.',
  },
  {
    label: 'How can I contact support?',
    icon: 'lucide:mail',
    content: 'Questions? Found a bug? Send us an email at contact@shelve.cloud. We\'re here to help.',
  }
]

function open() {
  isOpen.value = true
}

function close() {
  isOpen.value = false
}

defineExpose({
  open,
  close
})
</script>

<template>
  <UModal
    v-model:open="isOpen"
    title="About Vault"
    description="Everything you need to know about secure secret sharing"
    :ui="{
      overlay: 'bg-default/10 backdrop-blur-sm',
      body: 'max-h-[60vh] overflow-y-auto'
    }"
  >
    <template #body>
      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-4">
          <h3 class="text-lg font-semibold">
            FAQ
          </h3>
          <UAccordion
            variant="ghost"
            size="sm"
            :items="faqItems"
            :unmount-on-hide="false"
            :ui="{
              body: 'text-muted'
            }"
          >
            <template #body="{ item }">
              <MDC :value="item.content" unwrap="p" />
            </template>
          </UAccordion>
        </div>

        <Divider />

        <div class="flex flex-col gap-3">
          <h3 class="text-lg font-semibold">
            About
          </h3>
          <div class="flex flex-col gap-2 text-sm text-muted">
            <div class="flex items-center justify-between">
              <span class="font-mono italic tracking-tight">
                © {{ new Date().getFullYear() }} - Made by
                <NuxtLink
                  to="https://hrcd.fr/"
                  target="_blank"
                  class="text-muted hover:text-neutral-200 underline"
                >
                  HugoRCD
                </NuxtLink>
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="font-mono italic tracking-tight">
                <NuxtLink
                  to="https://dub.sh/shelve"
                  target="_blank"
                  class="text-muted hover:text-neutral-200 underline flex items-center gap-1"
                >
                  Powered by Shelve <UIcon name="custom:shelve" class="size-4" />
                </NuxtLink>
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
