<script setup lang="ts">
const route = useRoute()
const id = computed(() => route.query.id)

const value = ref('')
const reads = ref(1)
const ttl = ref([
  '1d',
  '7d',
  '30d',
])
const loading = ref(false)
const shareUrl = ref('')

const sealMode = computed(() => id.value)
const localId = ref(id)
const timeLeft = ref('')
const readsLeft = ref(0)

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
  } catch (error) {
    if (error.statusCode === 400) {
      toast.error(error.statusMessage)
    } else {
      toast.error('Failed to decrypt your secret(s)')
    }
  }
  loading.value = false
}

const selectedTtl = ref(ttl.value[0])

async function saveEnvFile() {
  loading.value = true
  try {
    shareUrl.value = await $fetch('/api/vault', {
      method: 'POST',
      body: {
        value: value.value,
        reads: reads.value,
        ttl: selectedTtl.value,
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

  reader.onload = (e) => value.value = e.target?.result as string

  reader.onerror = (e) => console.error('Error reading file:', e)

  reader.readAsText(file)
}

const dragOver = ref(false)

const border = computed(() => {
  if (dragOver.value) {
    return 'border-[0.5px] border-primary border-dashed'
  }
  return 'border-[0.5px] border-gray-200 dark:border-gray-800'
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
  if (!event.currentTarget.contains(event.relatedTarget as Node)) {
    dragOver.value = false
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  dragOver.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    parseEnvFile(files[0])
  }
}
</script>

<template>
  <div class="mx-auto flex h-full flex-col items-center justify-center">
    <div class="w-full border-y border-gray-500/20">
      <div class="mx-auto flex max-w-2xl justify-center px-5 sm:px-0">
        <CrossedDiv encrypted-text class="w-full">
          <div>
            <h1 class="main-gradient cursor-pointer text-3xl" @click="$router.push('/vault')">
              <LandingScrambleText label="Vault" />
            </h1>
            <p class="text-gray-500">
              Vault is a small utility to share secrets.
            </p>
          </div>
        </CrossedDiv>
      </div>
    </div>
    <form v-if="!sealMode" class="mx-auto mt-8 flex w-full max-w-2xl flex-col justify-center gap-2 px-5 sm:px-0" @submit.prevent="saveEnvFile">
      <div class="relative w-full">
        <UTextarea
          v-model="value"
          autoresize
          autofocus
          required
          :rows="5"
          class="w-full"
          placeholder="DATABASE_URL=your_value ..."
          :ui="{ base: border }"
          @dragenter.prevent="handleDragEnter"
          @dragover.prevent="handleDragOver"
          @dragleave.prevent="handleDragLeave"
          @drop.prevent="handleDrop"
        />
        <input type="file" accept="text" style="display: none;" @change="handleFileUpload">
      </div>
      <div class="mt-2 flex w-full items-end justify-between gap-2">
        <UFormGroup label="Reads">
          <UInput
            v-model="reads"
            label="Reads"
            type="number"
            min="1"
          />
        </UFormGroup>
        <UFormGroup label="TTL">
          <USelect
            v-model="selectedTtl"
            :options="ttl"
            default-value="1d"
            value-attribute="value"
            option-attribute="label"
          />
        </UFormGroup>
      </div>
      <div class="mt-4 w-full">
        <UButton block label="Encrypt" type="submit" color="gray" :loading />
      </div>
      <div v-if="shareUrl" class="mt-4 flex w-full rounded-lg border border-green-600/20 bg-green-600/10 p-4 shadow-md">
        <div class="flex w-full items-center justify-between gap-2">
          <span class="text-sm font-semibold text-green-500/80">
            Your secret(s) has been saved
          </span>
          <UButton color="green" variant="soft" icon="lucide:copy" label="Copy Share URL" @click="copyToClipboard(shareUrl)" />
        </div>
      </div>
    </form>
    <form v-else class="mx-auto mt-8 flex w-full max-w-2xl flex-col justify-center gap-2 px-5 sm:px-0" @submit.prevent="decryptEnvFile">
      <template v-if="!value">
        <div class="relative flex w-full flex-col gap-2">
          <UFormGroup label="Share ID">
            <UInput
              v-model="localId"
              placeholder="o75adqf..."
              required
            />
          </UFormGroup>
        </div>
        <div class="mt-4">
          <UButton
            block
            label="Decrypt"
            type="submit"
            color="gray"
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
        <span v-if="timeLeft" class="text-sm font-semibold text-gray-500/80">
          Time left: {{ timeLeft }}
        </span>
        <span v-if="readsLeft" class="text-sm font-semibold text-gray-500/80">
          Reads left: {{ readsLeft }}
        </span>
      </div>
    </form>
  </div>
</template>

<style scoped>

</style>
