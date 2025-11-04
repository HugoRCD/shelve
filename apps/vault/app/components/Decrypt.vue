<script setup lang="ts">
import { motion } from 'motion-v'

const route = useRoute()

const state = ref({
  value: '',
})

const id = ref(route.query.id as string || '')
const password = ref('')
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
      body: password.value ? { password: password.value } : {},
    })
    state.value.value = decryptedValue
    readsLeft.value = reads
    timeLeft.value = ttl
    toast.success('Your secret(s) has been decrypted')
  } catch (error: any) {
    if (error.statusCode === 400) {
      toast.error(error.statusMessage || 'Invalid id, password or link has expired')
    } else {
      toast.error('Failed to decrypt your secret(s)')
    }
  }
}
</script>

<template>
  <div>
    <motion.div
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.4, delay: 0.2 }"
    >
      <UForm :state class="bg-muted p-4 rounded-2xl shadow-2xl border border-muted/20 mx-auto flex w-full flex-col justify-center gap-2" @submit.prevent="decryptEnvFile">
        <template v-if="!state.value">
          <motion.div
            class="relative flex w-full flex-col gap-2"
            :initial="{ opacity: 0, y: 10 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.3, delay: 0.3 }"
          >
            <UFormField>
              <UInput
                v-model="id"
                class="w-full rounded-xl border-none"
                placeholder="Enter your share ID (e.g. o75adqf...)"
                required
                :ui="{
                  base: 'ring-0 border border-muted/20 rounded-xl',
                }"
              />
            </UFormField>
          </motion.div>
          <motion.div
            class="mt-2 flex w-full items-center justify-between gap-2"
            :initial="{ opacity: 0, y: 10 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.3, delay: 0.4 }"
          >
            <UFormField>
              <UInput
                v-model="password"
                type="password"
                class="rounded-xl border-none"
                placeholder="Password (optional)"
                autocomplete="off"
                data-1p-ignore
                data-lpignore="true"
                data-form-type="other"
                :ui="{
                  base: 'ring-0 border border-muted/20 rounded-xl',
                }"
              />
            </UFormField>
            <CustomButton
              label="Decrypt"
              type="submit"
              loading-auto
            />
          </motion.div>
        </template>
        <template v-else>
          <motion.div
            :initial="{ opacity: 0, scale: 0.98 }"
            :animate="{ opacity: 1, scale: 1 }"
            :transition="{ duration: 0.3 }"
          >
            <UFormField class="relative w-full" name="value">
              <UTextarea
                v-model="state.value"
                autoresize
                autofocus
                :rows="5"
                class="w-full rounded-xl border-none"
                placeholder="DATABASE_URL=your_value ..."
                :ui="{
                  base: 'bg-default rounded-xl ring-0 border border-muted/20',
                }"
              />
            </UFormField>
          </motion.div>
        </template>
        <motion.div
          v-if="state.value"
          class="mt-2 flex w-full items-center justify-between gap-2"
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :transition="{ duration: 0.3, delay: 0.2 }"
        >
          <span v-if="timeLeft" class="text-sm font-semibold text-muted/80">
            Time left: {{ timeLeft }}
          </span>
          <span v-if="readsLeft" class="text-sm font-semibold text-muted/80">
            Reads left: {{ readsLeft }}
          </span>
        </motion.div>
      </UForm>
    </motion.div>
    <motion.div
      class="mt-2 flex w-full flex-col items-center justify-center"
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
      :transition="{ duration: 0.3, delay: 0.5 }"
    >
      <ULink to="/" class="text-center text-sm text-muted/80 hover:underline">
        I want to create a new secret
      </ULink>
    </motion.div>
  </div>
</template>
