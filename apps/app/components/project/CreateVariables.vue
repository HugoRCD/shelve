<script setup lang="ts">
import type { Variable } from "@shelve/types";
import type { PropType } from "vue";

const { refresh, variables, projectId } = defineProps({
  refresh: {
    type: Function,
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
  items,
  createLoading,
  environment,
  selectedEnvironment,
  variablesInput,
  variablesToCreate,
  addVariable,
  removeVariable,
  createVariables,
} = useVariables(refresh, projectId, variables!);

onMounted(() => {
  document.addEventListener("paste", (e) => {
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;
    const pastedData = clipboardData.getData("text");
    if (!e.target?.closest("#varCreation")) return;
    if (!pastedData.includes("=")) return;
    e.preventDefault();
    const pastedDataArray = pastedData.split("\n");
    const pastedDataArrayFiltered = pastedDataArray.filter((data) => data !== "");
    const pastedDataArrayFilteredLength = pastedDataArrayFiltered.length;
    variablesToCreate.value = pastedDataArrayFilteredLength;
    variablesInput.value.variables = pastedDataArrayFiltered.map((data, index) => {
      const [key, value] = data.split("=");
      return {
        index,
        key: key.replace(/[\n\r'"]+/g, ""),
        value: value.replace(/[\n\r'"]+/g, ""),
        projectId: parseInt(projectId),
        environment: environment.value
      };
    });
  });
});
</script>

<template>
  <form id="varCreation" @submit.prevent="createVariables">
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
            <UCheckbox v-model="selectedEnvironment" value="preview" label="Staging" />
            <UCheckbox v-model="selectedEnvironment" value="development" label="Development" />
          </div>
        </div>
        <UDivider class="my-2" />
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
                <ProjectVarPrefix v-model="variablesInput.variables[variable - 1].key" class="w-full">
                  <UInput v-model="variablesInput.variables[variable - 1].key" required class="w-full" placeholder="e.g. API_KEY" />
                </ProjectVarPrefix>
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
          <UButton label="Save" color="primary" :loading="createLoading" type="submit" />
        </div>
      </template>
    </UCard>
  </form>
</template>
