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
  fileInputRef,
  dragOver,
  border,
  background,
  handleDragOver,
  handleDragEnter,
  handleDragLeave,
  handleDrop,
  triggerFileInput,
  handleFileUpload,
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
      click: () => copyEnv(variables!, 'production')
    },
    {
      label: 'For preview',
      icon: 'lucide:clipboard',
      click: () => copyEnv(variables!, 'preview')
    },
    {
      label: 'For development',
      icon: 'lucide:clipboard',
      click: () => copyEnv(variables!, 'development')
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
      click: () => downloadEnv(variables!, 'production')
    },
    {
      label: 'For preview',
      icon: 'lucide:download',
      click: () => downloadEnv(variables!, 'preview')
    },
    {
      label: 'For development',
      icon: 'lucide:download',
      click: () => downloadEnv(variables!, 'development')
    }
  ],
]

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
</script>

<template>
  <form id="varCreation" class="relative duration-500" @submit.prevent="createVariables">
    <UCard
      :ui="{ base: border }"
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
            <p class="text-sm font-normal text-gray-500">
              Manage your environment variables
            </p>
          </div>
          <UDropdown :items>
            <UButton color="gray" variant="ghost" icon="heroicons:ellipsis-horizontal-20-solid" />
          </UDropdown>
        </div>
      </template>
      <div :class="{ 'opacity-30': dragOver }" class="flex flex-col gap-3">
        <div class="flex w-full flex-col gap-4 md:w-1/3">
          <h4 class="text-sm font-semibold">
            Environments
          </h4>
          <div class="flex select-none gap-4">
            <UCheckbox v-model="selectedEnvironment" value="production" label="Production" />
            <UCheckbox v-model="selectedEnvironment" value="preview" label="Staging" />
            <UCheckbox v-model="selectedEnvironment" value="development" label="Development" />
          </div>
        </div>
        <UDivider class="my-1" />
        <div class="flex items-center gap-2">
          <UToggle v-model="autoUppercase" size="xs" />
          <h3 class="cursor-pointer text-sm font-semibold" @click="autoUppercase = !autoUppercase">
            Auto uppercase
          </h3>
        </div>
        <UDivider class="my-1" />
        <p class="text-xs font-normal text-gray-500">
          🤫 You can also paste all your environment variables (.env) as key value pairs to prefilled the form
        </p>
        <div class="mb-4 flex flex-col gap-2">
          <div class="hidden items-center sm:flex">
            <span class="w-full text-sm font-normal text-gray-500">Key</span>
            <span class="w-full text-sm font-normal text-gray-500">Value</span>
            <div class="w-[100px]" />
          </div>
          <div v-for="variable in variablesToCreate" :key="variable" class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
              <div class="flex flex-col items-start gap-2 sm:flex-row">
                <ProjectVarPrefix v-model="variablesInput.variables[variable - 1]!.key" class="w-full">
                  <UInput v-model="variablesInput.variables[variable - 1]!.key" required class="w-full" placeholder="e.g. API_KEY" />
                </ProjectVarPrefix>
                <UTextarea
                  v-model="variablesInput.variables[variable - 1]!.value"
                  required
                  :rows="1"
                  class="w-full"
                  autoresize
                  placeholder="e.g. 123456"
                />
                <UButton label="Remove" color="red" :disabled="variablesToCreate === 1" @click="removeVariable(variable - 1)" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div :class="{ 'opacity-30': dragOver }" class="flex justify-between gap-4">
          <div class="flex gap-2">
            <UButton label="Add variable" color="white" icon="heroicons:plus-circle-20-solid" @click="addVariable" />
            <input ref="fileInputRef" type="file" accept="text" style="display: none;" @change="handleFileUpload">
            <UButton label="Import .env" color="white" icon="lucide:download" @click="triggerFileInput" />
          </div>
          <UButton label="Save" color="primary" :loading="createLoading" type="submit" />
        </div>
      </template>
    </UCard>
  </form>
</template>
