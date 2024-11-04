<script setup lang="ts">
const value = ref('')
const reads = ref(1)
const ttl = ref([
  '1d',
  '7d',
  '30d',
])
const selectedTtl = ref(ttl.value[0])
const loading = ref(false)
const shareUrl = ref('')

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
  return 'border-[0.5px] border-neutral-200 dark:border-neutral-800'
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
  <form class="mx-auto mt-8 flex w-full max-w-2xl flex-col justify-center gap-2 px-5 sm:px-0" @submit.prevent="saveEnvFile">
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
      <UTooltip
        :content="{
          side: 'top',
        }"
        text="Reads are used to limit the number of times a secret can be read."
      >
        <UFormField label="Reads">
          <UInput
            v-model="reads"
            label="Reads"
            type="number"
            min="1"
          />
        </UFormField>
      </UTooltip>
      <UTooltip
        :content="{
          side: 'top',
        }"
        text="TTL is the time period after which the secret will be deleted."
      >
        <UFormField label="TTL">
          <USelect
            v-model="selectedTtl"
            :items="ttl"
            default-value="1d"
            value-attribute="value"
            option-attribute="label"
          />
        </UFormField>
      </UTooltip>
    </div>
    <div class="mt-4 w-full">
      <UButton
        block
        label="Encrypt"
        type="submit"
        color="neutral"
        :loading
      />
    </div>
    <div v-if="shareUrl" class="mt-4 flex w-full rounded-lg border border-green-600/20 bg-green-600/10 p-4 shadow-md">
      <div class="flex w-full items-center justify-between gap-2">
        <span class="text-sm font-semibold text-green-500/80">
          Your secret(s) has been saved
        </span>
        <UButton
          color="success"
          size="sm"
          variant="soft"
          icon="lucide:copy"
          label="Copy Share URL"
          @click="copyToClipboard(shareUrl)"
        />
      </div>
    </div>
  </form>
</template>

<style scoped>

</style>
