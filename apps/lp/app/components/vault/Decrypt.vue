<script setup lang="ts">
const route = useRoute()
const id = computed(() => route.query.id)

const value = ref('')

const localId = ref(id)
const timeLeft = ref('')
const readsLeft = ref(0)

const loading = ref(false)
async function decryptEnvFile() {
  loading.value = true
  try {
    const { decryptedValue, reads, ttl } = await $fetch(`/api/vault?id=${localId.value}`, {
      method: 'POST',
    })
    value.value = decryptedValue
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
  loading.value = false
}
</script>

<template>
  <form class="mx-auto mt-8 flex w-full max-w-2xl flex-col justify-center gap-2 px-5 sm:px-0" @submit.prevent="decryptEnvFile">
    <template v-if="!value">
      <div class="relative flex w-full flex-col gap-2">
        <UFormField label="Share ID">
          <UInput
            v-model="localId"
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
          color="neutral"
          :loading
        />
      </div>
    </template>
    <template v-else>
      <div class="mt-4">
        <UTextarea
          v-model="value"
          autoresize
          autofocus
          :rows="5"
          class="w-full"
          placeholder="DATABASE_URL=your_value ..."
        />
      </div>
    </template>
    <div class="mt-4 flex w-full items-center justify-between gap-2">
      <span v-if="timeLeft" class="text-sm font-semibold text-neutral-500/80">
        Time left: {{ timeLeft }}
      </span>
      <span v-if="readsLeft" class="text-sm font-semibold text-neutral-500/80">
        Reads left: {{ readsLeft }}
      </span>
    </div>
  </form>
</template>

<style scoped>

</style>
