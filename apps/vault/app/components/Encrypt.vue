<script setup lang="ts">
import { motion } from 'motion-v'

const state = ref({
  value: '',
})
const reads = ref(1)
const ttl = ref([
  '1d',
  '7d',
  '30d',
  'Indefinitely',
])
const selectedTtl = ref(ttl.value[0])
const password = ref('')
const loading = ref(false)
const shareUrl = ref('')

async function saveEnvFile() {
  loading.value = true
  try {
    shareUrl.value = await $fetch('/api/vault', {
      method: 'POST',
      body: {
        value: state.value.value,
        reads: reads.value,
        ttl: selectedTtl.value,
        ...(password.value && password.value.trim() && { password: password.value }),
      },
    })
    toast.success('Your secret(s) has been saved')
  } catch (error) {
    toast.error('Failed to save your secret(s)')
  }
  loading.value = false
}

function parseEnvFile(file: File) {
  const reader = new FileReader()

  reader.onload = (e) => state.value.value = e.target?.result as string

  reader.onerror = (e) => console.error('Error reading file:', e)

  reader.readAsText(file)
}

const dragOver = ref(false)

const border = computed(() => {
  if (dragOver.value) {
    return 'border border-primary border-dashed'
  }
  return 'border border-muted/20 ring-0'
})

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files ? target.files[0] : null
  if (file) {
    parseEnvFile(file)
  }
}

function handleDragEnter(event: DragEvent) {
  event.preventDefault()
  dragOver.value = true
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
}

function handleDragLeave(event: DragEvent) {
  if (!(event.currentTarget as Node).contains(event.relatedTarget as Node)) {
    dragOver.value = false
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  dragOver.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    parseEnvFile(files[0]!)
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
  toast.success('Link has been copied to clipboard')
}
</script>

<template>
  <div>
    <motion.div
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.4, delay: 0.2 }"
    >
      <UForm :state class="bg-muted p-4 rounded-2xl shadow-2xl border border-muted/20 mx-auto flex w-full flex-col justify-center gap-2" @submit.prevent="saveEnvFile">
        <motion.div
          :initial="{ opacity: 0, scale: 0.98 }"
          :animate="{ opacity: 1, scale: 1 }"
          :transition="{ duration: 0.3, delay: 0.3 }"
        >
          <UFormField class="relative w-full" name="value">
            <UTextarea
              v-model="state.value"
              autoresize
              required
              :rows="5"
              class="w-full rounded-xl border-none"
              placeholder="DATABASE_URL=your_value ..."
              :ui="{ base: ['bg-default rounded-xl', border] }"
              @dragenter.prevent="handleDragEnter"
              @dragover.prevent="handleDragOver"
              @dragleave.prevent="handleDragLeave"
              @drop.prevent="handleDrop"
            />
            <input type="file" accept="text" style="display: none;" @change="handleFileUpload">
          </UFormField>
        </motion.div>
        <motion.div
          class="mt-2 flex w-full items-end justify-between gap-2"
          :initial="{ opacity: 0, y: 10 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.3, delay: 0.4 }"
        >
          <div class="flex items-center gap-2">
            <UTooltip
              :content="{
                side: 'top',
              }"
              text="Reads are used to limit the number of times a secret can be read."
            >
              <UFormField>
                <UInputNumber
                  v-model="reads"
                  label="Reads"
                  :min="1"
                  :ui="{
                    base: 'ring-0 border border-muted/20 rounded-xl',
                  }"
                />
              </UFormField>
            </UTooltip>
            <UTooltip
              :content="{
                side: 'top',
              }"
              text="TTL is the time period after which the secret will be deleted."
            >
              <UFormField>
                <USelect
                  v-model="selectedTtl"
                  :items="ttl"
                  default-value="1d"
                  value-attribute="value"
                  option-attribute="label"
                  :ui="{
                    base: 'ring-0 border border-muted/20 rounded-xl',
                    content: 'min-w-fit'
                  }"
                />
              </UFormField>
            </UTooltip>
            <UTooltip
              :content="{
                side: 'top',
              }"
              text="Optional password to protect your secret. Leave empty if not needed."
            >
              <UFormField>
                <UInput
                  v-model="password"
                  type="password"
                  label="Password"
                  placeholder="Optional"
                  autocomplete="off"
                  data-1p-ignore
                  data-lpignore="true"
                  data-form-type="other"
                  :ui="{
                    base: 'ring-0 border border-muted/20 rounded-xl',
                  }"
                />
              </UFormField>
            </UTooltip>
          </div>
          <CustomButton
            label="Encrypt"
            type="submit"
            loading-auto
          />
        </motion.div>
      </UForm>
    </motion.div>
    <motion.div
      class="mt-2 flex w-full flex-col items-center justify-center"
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
      :transition="{ duration: 0.3, delay: 0.5 }"
    >
      <ULink to="/?decrypt=true" class="text-center text-sm text-muted/80 hover:underline">
        I already have a secret to decrypt
      </ULink>
    </motion.div>
    <motion.div
      class="mt-4 w-full"
      :initial="{ opacity: 0, y: 10 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.4, delay: 0.2 }"
    >
      <div v-if="shareUrl" class="bg-muted p-4 rounded-2xl shadow-2xl border border-muted/20 flex items-center justify-between gap-3">
        <div class="flex flex-col">
          <span class="text-sm font-semibold text-highlighted">
            Your secret has been encrypted
          </span>
          <span class="text-xs text-muted">
            Share this link securely
          </span>
        </div>
        <CustomButton
          label="Copy link"
          icon="lucide:copy"
          @click="copyToClipboard(shareUrl)"
        />
      </div>
    </motion.div>
  </div>
</template>
