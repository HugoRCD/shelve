<script setup lang="ts">
import type { TokenPermission, TokenWithSecret } from '@types'

const tokenName = ref('')
const expiresIn = ref<string>('2592000')
const permissions = ref<TokenPermission[]>(['read', 'write'])
const loading = ref(false)
const createdToken = ref<TokenWithSecret | null>(null)
const popoverOpen = ref(false)

const emits = defineEmits(['create'])

const expiryOptions = [
  { value: '3600', label: '1 hour' },
  { value: '86400', label: '1 day' },
  { value: '2592000', label: '30 days' },
  { value: '7776000', label: '90 days' },
  { value: '31536000', label: '1 year' },
  { value: '0', label: 'Never (not recommended)' },
]

const permissionOptions = [
  { value: 'read', label: 'read' },
  { value: 'write', label: 'write' },
]

async function createToken() {
  loading.value = true
  try {
    const expiresInNum = expiresIn.value === '0' ? null : Number(expiresIn.value)
    const created = await $fetch<TokenWithSecret>('/api/tokens', {
      method: 'POST',
      body: {
        name: tokenName.value,
        expiresIn: expiresInNum,
        scopes: { permissions: permissions.value },
      },
    })
    createdToken.value = created
    emits('create')
    tokenName.value = ''
    toast.success('Token created — copy it now, you will not see it again.')
  } catch {
    toast.error('Failed to create token')
  }
  loading.value = false
}

function copyToken() {
  if (!createdToken.value) return
  navigator.clipboard.writeText(createdToken.value.token)
  toast.success('Token copied to clipboard')
}

function dismissCreated() {
  createdToken.value = null
  popoverOpen.value = false
}
</script>

<template>
  <div class="hidden items-center justify-end gap-2 sm:flex">
    <UPopover v-model:open="popoverOpen" arrow>
      <CustomButton size="sm" label="Create token" />
      <template #content>
        <UCard v-if="!createdToken">
          <form class="flex flex-col gap-3" @submit.prevent="createToken()">
            <p class="text-sm font-semibold leading-6">
              Create a token
            </p>
            <UInput v-model="tokenName" label="Token name" placeholder="My CI token" />
            <USelect v-model="expiresIn" :items="expiryOptions" placeholder="Expiry" />
            <UCheckboxGroup v-model="permissions" :items="permissionOptions" orientation="horizontal" />
            <UButton :loading label="Create" type="submit" />
          </form>
        </UCard>
        <UCard v-else>
          <div class="flex flex-col gap-3">
            <p class="text-sm font-semibold leading-6">
              Save this token — you will not see it again
            </p>
            <div class="flex items-center gap-2 rounded-md border border-default bg-muted/40 p-2 font-mono text-xs break-all">
              {{ createdToken.token }}
            </div>
            <div class="flex justify-end gap-2">
              <UButton variant="ghost" label="Done" @click="dismissCreated" />
              <UButton icon="lucide:copy" label="Copy" @click="copyToken" />
            </div>
          </div>
        </UCard>
      </template>
    </UPopover>
  </div>
</template>
