<script setup lang="ts">
import type { Variable } from '@shelve/types'
import type { PropType } from 'vue'

const { refresh, variables, projectId } = defineProps({
  refresh: {
    type: Function as PropType<() => Promise<void>>,
    required: true,
  },
  variables: {
    type: Array as PropType<Variable[]>,
  },
  projectId: {
    type: String,
    required: true,
  },
})

const {
  createLoading,
  environment,
  selectedEnvironment,
  variablesInput,
  variablesToCreate,
  addVariable,
  removeVariable,
  createVariables,
} = useVariables(refresh, projectId)

const items = [
  [
    {
      label: 'Copy .env',
      disabled: true
    }
  ],
  [
    {
      label: 'For production',
      icon: 'lucide:clipboard',
      onSelect: () => copyEnv(variables!, 'production')
    },
    {
      label: 'For preview',
      icon: 'lucide:clipboard',
      onSelect: () => copyEnv(variables!, 'preview')
    },
    {
      label: 'For development',
      icon: 'lucide:clipboard',
      onSelect: () => copyEnv(variables!, 'development')
    }
  ],
  [
    {
      label: 'Download .env',
      disabled: true
    },
  ],
  [
    {
      label: 'For production',
      icon: 'lucide:download',
      onSelect: () => downloadEnv(variables!, 'production')
    },
    {
      label: 'For preview',
      icon: 'lucide:download',
      onSelect: () => downloadEnv(variables!, 'preview')
    },
    {
      label: 'For development',
      icon: 'lucide:download',
      onSelect: () => downloadEnv(variables!, 'development')
    }
  ],
]

const fileInputRef = ref<HTMLInputElement | null>(null)

const triggerFileInput = () => {
  fileInputRef.value?.click()
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

function parseEnvFile(file: File) {
  const reader = new FileReader()

  reader.onload = (e) => {
    const content = e.target?.result as string
    const lines = content.split('\n').filter((line) => line.trim() !== '')
    const filteredLines = lines.filter((line) => !line.startsWith('#'))
    const variables = filteredLines.map((line, index) => {
      const [key, value] = line.split('=')
      if (!key || !value) {
        toast.error('Invalid .env file')
        throw new Error('Invalid .env')
      }
      return {
        index,
        key: key.replace(/[\n\r'"]+/g, ''),
        value: value.replace(/[\n\r'"]+/g, ''),
        projectId: parseInt(projectId),
        environment: environment.value,
      }
    })
    variablesToCreate.value = variables.length
    variablesInput.value.variables = variables
  }

  reader.onerror = (e) => {
    console.error('Error reading file:', e)
  }

  reader.readAsText(file)
}

onMounted(() => {
  document.addEventListener('paste', (e) => {
    const { clipboardData } = e
    if (!clipboardData) return
    const pastedData = clipboardData.getData('text')
    if (!e.target?.closest('#varCreation')) return
    if (!pastedData.includes('=')) return
    e.preventDefault()
    const pastedDataArray = pastedData.split('\n')
    const pastedDataArrayFiltered = pastedDataArray.filter((data) => data !== '')
    variablesToCreate.value = pastedDataArrayFiltered.length
    variablesInput.value.variables = pastedDataArrayFiltered.map((data, index) => {
      const [key, value] = data.split('=')
      if (!key || !value) throw new Error('Invalid .env')
      return {
        index,
        key: key.replace(/[\n\r'"]+/g, ''),
        value: value.replace(/[\n\r'"]+/g, ''),
        projectId: parseInt(projectId),
        environment: environment.value
      }
    })
  })
})

const autoUppercase = useCookie<boolean>('autoUppercase', {
  watch: true,
  default: () => true,
})

const handlePasswordGenerated = (password: string, index: number) => {
  variablesInput.value.variables[index].value = password
}
</script>

<template>
  <form id="varCreation" class="relative duration-500" @submit.prevent="createVariables">
    <UCard
      :ui="{ root: border }"
      class="duration-500"
      @dragenter.prevent="handleDragEnter"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <div
        :class="{ 'absolute': dragOver, 'hidden': !dragOver }"
        class="
        overlay
        left-0
        top-0
        z-40
        size-full
        content-center
        items-center
        justify-center"
      >
        <div class="icon-container flex flex-col items-center gap-2">
          <UIcon name="lucide:file-up" class="text-primary size-10" />
          <p class="text-lg font-semibold">
            Drop your file here
          </p>
        </div>
      </div>
      <template #header>
        <div :class="{ 'opacity-30': dragOver }" class="flex items-center justify-between">
          <div class="flex flex-col">
            <h2 class="text-lg font-semibold">
              Environment Variables
            </h2>
            <p class="text-sm font-normal text-neutral-500">
              Manage your environment variables
            </p>
          </div>
          <UDropdownMenu :items>
            <UButton color="neutral" variant="ghost" icon="heroicons:ellipsis-horizontal-20-solid" />
          </UDropdownMenu>
        </div>
      </template>
      <div :class="{ 'opacity-30': dragOver }" class="flex flex-col gap-3">
        <div class="flex w-full flex-col gap-4 md:w-1/3">
          <h4 class="text-sm font-semibold">
            Environments
          </h4>
          <div class="flex select-none gap-4">
            <UCheckbox v-model="selectedEnvironment.production" name="production" label="Production" />
            <UCheckbox v-model="selectedEnvironment.preview" name="preview" label="Staging" />
            <UCheckbox v-model="selectedEnvironment.development" name="development" label="Development" />
          </div>
        </div>
        <UDivider class="my-1" />
        <div class="flex items-center gap-2">
          <USwitch v-model="autoUppercase" size="xs" />
          <h3 class="cursor-pointer text-sm font-semibold" @click="autoUppercase = !autoUppercase">
            Auto uppercase
          </h3>
        </div>
        <UDivider class="my-1" />
        <p class="text-xs font-normal text-neutral-500">
          🤫 You can also paste all your environment variables (.env) as key value pairs to prefilled the form
        </p>
        <div class="mb-4 flex flex-col gap-2">
          <div class="hidden items-center sm:flex">
            <span class="w-full text-sm font-normal text-neutral-500">Key</span>
            <span class="w-full text-sm font-normal text-neutral-500">Value</span>
            <div class="w-[100px]" />
          </div>
          <div v-for="variable in variablesToCreate" :key="variable" class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
              <div class="flex flex-col items-start gap-2 sm:flex-row">
                <div class="w-full flex gap-1">
                  <UInput v-model="variablesInput.variables[variable - 1]!.key" required class="w-full" placeholder="e.g. API_KEY" />
                  <ProjectVarPrefix v-model="variablesInput.variables[variable - 1]!.key" />
                </div>
                <div class="w-full flex gap-1">
                  <UTextarea
                    v-model="variablesInput.variables[variable - 1]!.value"
                    required
                    :rows="1"
                    class="w-full"
                    autoresize
                    placeholder="e.g. 123456"
                  />
                  <ProjectPasswordGenerator @password-generated="handlePasswordGenerated($event, variable - 1)" />
                </div>
                <UTooltip text="Remove variable" :content="{ side: 'top' }">
                  <UButton icon="lucide:x" variant="soft" color="error" @click="removeVariable(variable - 1)" />
                </UTooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div :class="{ 'opacity-30': dragOver }" class="flex justify-between gap-4">
          <div class="flex gap-2">
            <UButton
              label="Add variable"
              color="neutral"
              size="xs"
              variant="soft"
              icon="heroicons:plus-circle-20-solid"
              @click="addVariable"
            />
            <input ref="fileInputRef" type="file" accept="text" style="display: none;" @change="handleFileUpload">
            <UButton
              label="Import .env"
              color="neutral"
              size="xs"
              variant="soft"
              icon="lucide:download"
              @click="triggerFileInput"
            />
          </div>
          <UButton label="Save" color="primary" :loading="createLoading" type="submit" />
        </div>
      </template>
    </UCard>
  </form>
</template>
