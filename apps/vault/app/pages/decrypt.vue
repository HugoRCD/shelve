<script setup lang="ts">
const route = useRoute()

const state = ref({
  value: '',
})

const id = ref(route.query.id as string || '')
const timeLeft = ref('')
const readsLeft = ref(0)

async function decryptEnvFile() {
  try {
    const { decryptedValue, reads, ttl } = await $fetch<{
      decryptedValue: string
      reads: number
      ttl: string
    }>(`/api/vault?id=${id.value}`, {
      method: 'POST',
    })
    state.value.value = decryptedValue
    readsLeft.value = reads
    timeLeft.value = ttl
    toast.success('Your secret(s) has been decrypted')
  } catch (error: any) {
    if (error.statusCode === 400) {
      toast.error(error.statusMessage)
    } else {
      toast.error('Failed to decrypt your secret(s)')
    }
  }
}
</script>

<template>
  <UForm :state class="mx-auto mt-8 flex w-full flex-col justify-center gap-2 px-5 sm:px-0" @submit.prevent="decryptEnvFile">
    <template v-if="!state.value">
      <div class="relative flex w-full flex-col gap-2">
        <UFormField label="Share ID">
          <UInput
            v-model="id"
            class="w-full"
            placeholder="o75adqf..."
            required
          />
        </UFormField>
      </div>
      <div class="mt-4">
        <UButton
          block
          label="Decrypt"
          type="submit"
          loading-auto
        />
      </div>
    </template>
    <template v-else>
      <div class="mt-4">
        <UTextarea
          v-model="state.value"
          autoresize
          autofocus
          :rows="5"
          class="w-full"
          placeholder="DATABASE_URL=your_value ..."
        />
      </div>
    </template>
    <div v-if="state.value" class="mt-2 flex w-full items-center justify-between gap-2">
      <span v-if="timeLeft" class="text-sm font-semibold text-(--ui-text-muted)/80">
        Time left: {{ timeLeft }}
      </span>
      <span v-if="readsLeft" class="text-sm font-semibold text-(--ui-text-muted)/80">
        Reads left: {{ readsLeft }}
      </span>
    </div>
    <div class="mt-2 flex w-full flex-col items-center justify-center">
      <ULink to="/" class="text-center text-sm text-(--ui-text-muted)/80 hover:underline">
        I want to create a new secret
      </ULink>
    </div>
  </UForm>
</template>

