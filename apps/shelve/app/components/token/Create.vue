<script setup lang="ts">
import type { Token } from '@types'

const tokenName = ref('')
const loading = ref(false)
const emits = defineEmits(['create'])

async function createToken() {
  loading.value = true
  try {
    await $fetch<Token>('/api/tokens', {
      method: 'POST',
      body: {
        name: tokenName.value,
      },
    })
    emits('create')
    tokenName.value = ''
    toast.success('Token created')
  } catch (error) {
    toast.error('Failed to create token')
  }
  loading.value = false
}
</script>

<template>
  <div class="hidden items-center justify-end gap-2 sm:flex">
    <UPopover arrow>
      <UButton size="xs">
        Create a token
      </UButton>
      <template #content>
        <form @submit.prevent="createToken(tokenName)">
          <UCard>
            <div class="flex flex-col gap-2">
              <p class="flex gap-2 text-sm font-semibold leading-6">
                Create a token
              </p>
              <div class="flex gap-2">
                <UInput v-model="tokenName" label="Token name" placeholder="Token name" />
                <UButton :loading label="Create" type="submit" />
              </div>
            </div>
          </UCard>
        </form>
      </template>
    </UPopover>
  </div>
</template>
