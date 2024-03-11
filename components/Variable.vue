<script setup lang="ts">
import type { Variable } from "~/types/Variables";
import type { PropType, Ref } from 'vue';

const props = defineProps({
  variable: {
    type: Object as PropType<Variable>,
    required: true
  },
});

const localVariable = ref(props.variable) as Ref<Variable>;

const { status, error, execute } = useFetch(`/api/variable`, {
  method: "POST",
  body: localVariable,
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
}

async function deleteCurrentVariable() {
  await deleteVar();
  if (deleteError.value) toast.error("An error occurred");
  else toast.success("Your variable has been deleted");
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
      <h3 class="flex flex-col text-lg font-semibold">
        {{ variable.key }}
        <span class="text-xs font-normal text-gray-500">
          {{ variable.environment }}
        </span>
      </h3>
      <UDropdown :items="items">
        <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
      </UDropdown>
    </div>
    <div v-if="showEdit" class="flex flex-col gap-2 py-2">
      <hr class="border-1 border-black/10">
      <form class="flex flex-col gap-4" @submit.prevent="updateCurrentVariable">
        <FormGroup v-model="localVariable.key" label="Key" />
        <FormGroup v-model="localVariable.value" label="Value" type="textarea" />
        <div class="mt-2 flex justify-between gap-4">
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
