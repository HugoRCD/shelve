<script setup lang="ts">
import { copyToClipboard } from "~/composables/useClipboard";
import type { Variable } from "@shelve/types";
import type { PropType, Ref } from 'vue';

const props = defineProps({
  variable: {
    type: Object as PropType<Variable>,
    required: true
  },
});

const localVariable = ref(props.variable) as Ref<Variable>;
const selectedEnvironment = ref(props.variable.environment.split("|"));
const environment = computed(() => selectedEnvironment.value.join("|"));

const variableToUpdate = computed(() => {
  return {
    ...localVariable.value,
    environment: environment.value
  }
})

const { status, error, execute } = useFetch(`/api/variable`, {
  method: "POST",
  body: {
    projectId: props.variable.projectId,
    variables: [variableToUpdate.value]
  },
  watch: false,
  immediate: false,
})

const { status: deleteStatus, error: deleteError, execute: deleteVar } = useFetch(`/api/variable/${props.variable.id}/${props.variable.environment}`, {
  method: "DELETE",
  watch: false,
  immediate: false,
})

async function updateCurrentVariable() {
  await execute();
  if (error.value) toast.error("An error occurred");
  else toast.success("Your variable has been updated");
  emit("refresh");
}

const emit = defineEmits(["refresh"]);
async function deleteCurrentVariable() {
  await deleteVar();
  if (deleteError.value) toast.error("An error occurred");
  else toast.success("Your variable has been deleted");
  emit("refresh");
}

const showEdit = ref(false)
const items = [
  [
    {
      label: "Edit",
      icon: "i-lucide-pen-line",
      click: () => showEdit.value = !showEdit.value
    },
    {
      label: "Copy full variable",
      icon: "i-lucide-clipboard-plus",
      click: () => copyToClipboard(`${localVariable.value.key}=${localVariable.value.value}`, "Variable copied to clipboard")
    },
    {
      label: "Delete",
      icon: "i-lucide-trash",
      iconClass: "text-red-500 dark:text-red-500",
      click: deleteCurrentVariable
    }
  ]
];
</script>

<template>
  <UCard>
    <div class="flex w-full items-center justify-between">
      <div class="flex flex-col gap-1">
        <h3 class="flex items-center gap-1 text-sm font-semibold sm:text-base">
          {{ variable.key }}
          <UTooltip text="Copy variable clipboard">
            <UButton color="gray" variant="ghost" icon="i-lucide-clipboard-plus" @click="copyToClipboard(variable.value, 'Variable value copied')" />
          </UTooltip>
        </h3>
        <span class="text-xs font-normal text-gray-500">
          {{ capitalize(variable.environment.split("|").join(", ")) }}
        </span>
      </div>
      <div class="flex items-center gap-2">
        <p class="hidden text-xs font-normal text-gray-500 md:block">
          Last updated: {{ new Date(variable.updatedAt).toLocaleDateString() }}
        </p>
        <UDropdown :items="items">
          <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
        </UDropdown>
      </div>
    </div>
    <div v-if="showEdit" class="flex flex-col gap-2 py-2">
      <hr class="border-1 border-black/10">
      <form class="flex flex-col gap-6" @submit.prevent="updateCurrentVariable">
        <div class="flex flex-col gap-8 sm:flex-row">
          <div class="flex flex-col gap-4 md:w-2/3">
            <FormGroup v-model="localVariable.key" label="Key" />
            <FormGroup v-model="localVariable.value" label="Value" type="textarea" />
          </div>
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
        </div>
        <hr class="border-1 border-black/10 dark:border-white/5">
        <div class="flex justify-between gap-4">
          <div>
            <UButton color="primary" type="submit" trailing :loading="status === 'pending'">
              Save
            </UButton>
            <UButton color="white" variant="soft" @click="showEdit = false">
              Cancel
            </UButton>
          </div>
          <UButton color="red" variant="soft" :loading="deleteStatus === 'pending'">
            Delete
          </UButton>
        </div>
      </form>
    </div>
  </UCard>
</template>

<style scoped>

</style>
