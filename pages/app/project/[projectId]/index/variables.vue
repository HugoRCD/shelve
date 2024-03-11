<script setup lang="ts">
import type { VariablesCreateInput } from "~/types/Variables";

const { projectId } = useRoute().params
const variablesToCreate = ref(1)
const variablesInput = ref<VariablesCreateInput>({
  projectId: parseInt(projectId as string),
  variables: [
    {
      index: 1,
      key: "",
      value: "",
      environment: "production",
      projectId: parseInt(projectId as string),
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
    projectId: parseInt(projectId as string),
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

const { data: variables, status, refresh } = useFetch(`/api/variable/project/${projectId}`, {
  method: "GET",
  watch: false,
})

const { data, status: createStatus, error, execute } = useFetch(`/api/variable/`, {
  method: "POST",
  body: variablesInput.value,
  watch: false,
  immediate: false,
})

async function createVariables() {
  await execute()
  if (error.value) toast.error("An error occurred")
  else toast.success("Your variables have been created")
  await refresh()
}
</script>

<template>
  <div class="mt-6 flex flex-col gap-4">
    <UCard>
      <form class="flex flex-col gap-4" @submit.prevent="createVariables">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">
            Environment Variables
          </h2>
        </div>
        <UDivider class="my-2" />
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
        <div class="flex flex-col gap-2">
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
        <UDivider class="my-2" />
        <div class="flex justify-between gap-4">
          <UButton color="white" icon="i-heroicons-plus-circle-20-solid" @click="addVariable">
            Add Variable
          </UButton>
          <UButton color="primary" :loading="createStatus === 'pending'" type="submit">
            Save
          </UButton>
        </div>
      </form>
    </UCard>
    <div v-if="status !== 'pending'" class="flex flex-col gap-4">
      <div v-for="variable in variables" :key="variable.id">
        <ProjectVariableItem :variable @refresh="refresh" />
      </div>
    </div>
    <div v-else class="flex flex-col gap-4">
      <div v-for="variable in 5" :key="variable">
        <USkeleton class="h-16 w-full" />
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
