<script setup lang="ts">
const route = useRoute()
const { data } = route.params

const value = ref('')
const reads = ref(1)
const ttl = ref([
  '1d',
  '7d',
  '30d',
])

const selectedTtl = ref(ttl.value[0])

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
        <CrossedDiv encrypted-text class="flex w-full justify-center">
          <div>
            <h1 class="main-gradient text-3xl">
              <LandingScrambleText label="EnvShare" />
            </h1>
            <p class="text-gray-500">
              EnvShare is a small utility to share secrets.
            </p>
          </div>
        </CrossedDiv>
      </div>
    </div>
    <div class="mx-auto mt-8 flex w-full max-w-2xl flex-col justify-center gap-2 px-5 sm:px-0">
      <div class="relative w-full">
        <UTextarea
          v-model="value"
          autoresize
          autofocus
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
        <UButton block label="Encrypt" color="gray" />
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
