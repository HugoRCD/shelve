<script setup lang="ts">
import type { Variable, VariablesCreateInput } from "@shelve/types";
import type { PropType, Ref } from "vue";

const props = defineProps({
  variables: {
    type: Array as PropType<Variable[]>,
  },
  projectId: {
    type: String,
    required: true,
  },
})

const variables = toRef(props, "variables") as Ref<Variable[]>
const projectId = toRef(props, "projectId") as Ref<string>
const variablesToCreate = ref(1)
const variablesInput = ref<VariablesCreateInput>({
  projectId: parseInt(projectId.value),
  variables: [
    {
      index: 1,
      key: "",
      value: "",
      environment: "production",
      projectId: parseInt(projectId.value),
    },
  ],
})
const selectedEnvironment = ref(["production"])
const environment = computed(() => selectedEnvironment.value.join("|"));

function addVariable() {
  variablesToCreate.value++
  variablesInput.value.variables.push({
    index: variablesToCreate.value,
    key: "",
    value: "",
    environment: environment.value,
    projectId: parseInt(projectId.value as string),
  })
}

watch(selectedEnvironment, () => {
  variablesInput.value.variables.forEach((variable) => {
    variable.environment = environment.value
  })
})

function removeVariable(index: number) {
  variablesToCreate.value--
  variablesInput.value.variables.splice(index, 1)
}

const { data, status: createStatus, error, execute } = useFetch(`/api/variable/`, {
  method: "POST",
  body: variablesInput.value,
  watch: false,
  immediate: false,
})

const emit = defineEmits(["refresh"])
async function createVariables() {
  await execute()
  if (error.value) toast.error("An error occurred")
  else toast.success("Your variables have been created")
  variablesToCreate.value = 1
  variablesInput.value = {
    projectId: parseInt(projectId.value),
    variables: [
      {
        index: 1,
        key: "",
        value: "",
        environment: "production",
        projectId: parseInt(projectId.value),
      },
    ],
  }
  emit("refresh")
}

function copyEnv(env: "production" | "staging" | "development") {
  const envVariables = variables.value.filter((variable) => variable.environment.includes(env))
  const envString = envVariables.map((variable) => `${variable.key}=${variable.value}`).join("\n")
  copyToClipboard(envString, "Copied to clipboard")
}

function downloadEnv(env: "production" | "staging" | "development") {
  const envVariables = variables.value.filter((variable) => variable.environment.includes(env))
  const envString = envVariables.map((variable) => `${variable.key}=${variable.value}`).join("\n")
  const blob = new Blob([envString], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `.env.${env}`
  a.click()
  URL.revokeObjectURL(url)
}

const items = [
  [
    {
      label: "Copy .env",
      disabled: true
    }
  ],
  [
    {
      label: "For production",
      icon: "i-lucide-clipboard",
      click: () => copyEnv("production")
    },
    {
      label: "For staging",
      icon: "i-lucide-clipboard",
      click: () => copyEnv("staging")
    },
    {
      label: "For development",
      icon: "i-lucide-clipboard",
      click: () => copyEnv("development")
    }
  ],
  [
    {
      label: "Download .env",
      disabled: true
    },
  ],
  [
    {
      label: "For production",
      icon: "i-lucide-download",
      click: () => downloadEnv("production")
    },
    {
      label: "For staging",
      icon: "i-lucide-download",
      click: () => downloadEnv("staging")
    },
    {
      label: "For development",
      icon: "i-lucide-download",
      click: () => downloadEnv("development")
    }
  ],
]
</script>

<template>
  <form @submit.prevent="createVariables">
    <UCard :ui="{ background: 'bg-white dark:bg-neutral-950' }">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex flex-col">
            <h2 class="text-lg font-semibold">
              Environment Variables
            </h2>
            <p class="text-sm font-normal text-gray-500">
              Manage your environment variables
            </p>
          </div>
          <UDropdown :items="items">
            <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
          </UDropdown>
        </div>
      </template>
      <div class="flex flex-col gap-4">
        <div class="flex w-full flex-col gap-4 md:w-1/3">
          <h4 class="text-sm font-semibold">
            Environments
          </h4>
          <div class="flex flex-col gap-4">
            <UCheckbox v-model="selectedEnvironment" value="production" label="Production" />
            <UCheckbox v-model="selectedEnvironment" value="staging" label="Staging" />
            <UCheckbox v-model="selectedEnvironment" value="development" label="Development" />
          </div>
        </div>
        <UDivider class="my-2" />
        <div class="mb-4 flex flex-col gap-2">
          <div class="flex items-center">
            <span class="w-full text-sm font-normal text-gray-500">Key</span>
            <span class="w-full text-sm font-normal text-gray-500">Value</span>
            <div class="w-[100px]" />
          </div>
          <div v-for="variable in variablesToCreate" :key="variable" class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
              <div class="flex flex-col items-start gap-2 sm:flex-row">
                <UInput v-model="variablesInput.variables[variable - 1].key" required class="w-full" placeholder="e.g. API_KEY" />
                <UTextarea
                  v-model="variablesInput.variables[variable - 1].value"
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
        <div class="flex justify-between gap-4">
          <UButton label="Add variable" color="white" icon="i-heroicons-plus-circle-20-solid" @click="addVariable" />
          <UButton label="Save" color="primary" :loading="createStatus === 'pending'" type="submit" />
        </div>
      </template>
    </UCard>
  </form>
</template>
