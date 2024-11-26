<script setup lang="ts">
import type { Variable } from '@shelve/types'
import { parseEnvFile } from '@shelve/utils'

type CreateVariablesProps = {
  refresh: () => Promise<void>
  variables: Variable[]
  projectId: string
}

const { refresh, variables, projectId } = defineProps<CreateVariablesProps>()

const {
  createLoading,
  selectedEnvironments,
  variablesInput,
  variablesToCreate,
  addVariable,
  removeVariable,
  createVariables,
} = useVariables(refresh, projectId)

const teamEnv = useTeamEnv()

const items = actionVariablesItem(variables)

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
    getEnvFile(file)
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
  if (!event.currentTarget?.contains(event.relatedTarget as Node)) {
    dragOver.value = false
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  dragOver.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    getEnvFile(files[0])
  }
}

function getEnvFile(file: File) {
  const reader = new FileReader()

  reader.onload = (e) => {
    const content = e.target?.result as string
    try {
      const variables = parseEnvFile(content, true)
      variablesToCreate.value = variables.length
      variablesInput.value.variables = variables
    } catch (error) {
      toast.error('Invalid .env file')
    }
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
    const content = clipboardData.getData('text')
    if (!e.target?.closest('#varCreation')) return
    if (!content.includes('=')) return
    e.preventDefault()
    try {
      const variables = parseEnvFile(content, true)
      variablesToCreate.value = variables.length
      variablesInput.value.variables = variables
    } catch (error) {
      toast.error('Invalid .env content')
    }
  })
})

const autoUppercase = useCookie<boolean>('autoUppercase', {
  watch: true,
  default: () => true,
})

const handlePasswordGenerated = (password: string, index: number) => variablesInput.value.variables[index].value = password
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
          <UDropdownMenu
            :items
            :content="{
              align: 'start',
              side: 'right',
              sideOffset: 8
            }"
          >
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
            <UCheckbox
              v-for="env in teamEnv"
              :key="env.id"
              v-model="selectedEnvironments[env.id]"
              :name="env.name"
              :label="capitalize(env.name)"
            />
          </div>
        </div>
        <USeparator class="my-1" />
        <div class="flex items-center gap-2">
          <USwitch v-model="autoUppercase" size="xs" />
          <h3 class="cursor-pointer text-sm font-semibold" @click="autoUppercase = !autoUppercase">
            Auto uppercase
          </h3>
        </div>
        <USeparator class="my-1" />
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
                  <UInput
                    v-model="variablesInput.variables[variable - 1]!.key"
                    required
                    class="w-full"
                    placeholder="e.g. API_KEY"
                  />
                  <VariablePrefix v-model="variablesInput.variables[variable - 1]!.key" />
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
                  <VariableGenerator @password-generated="handlePasswordGenerated($event, variable - 1)" />
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
