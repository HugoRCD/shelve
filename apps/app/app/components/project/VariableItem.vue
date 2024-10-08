<script setup lang="ts">
import type { Variable } from '@shelve/types'
import type { PropType } from 'vue'

const { refresh, variable, projectId } = defineProps({
  refresh: {
    type: Function,
    required: true,
  },
  variables: {
    type: Array as PropType<Variable[]>,
  },
  variable: {
    type: Object as PropType<Variable>,
    required: true
  },
  projectId: {
    type: String,
    required: true,
  },
  isSelected: {
    type: Boolean,
    required: true
  }
})

const {
  updateLoading,
  deleteLoading,
  updateVariable,
  deleteVariable,
} = useVariables(refresh, projectId)

const emit = defineEmits(['toggleSelected'])
const localVariable = variable
const selectedEnvironment = ref(variable.environment.split('|'))
const environment = computed(() => selectedEnvironment.value.join('|'))

const variableToUpdate = computed(() => {
  return {
    ...localVariable,
    environment: environment.value
  }
})

const showEdit = ref(false)
const items = [
  [
    {
      label: 'Edit',
      icon: 'lucide:pen-line',
      click: () => showEdit.value = !showEdit.value
    },
    {
      label: 'Copy full variable',
      icon: 'lucide:clipboard-plus',
      click: () => copyToClipboard(`${localVariable.value.key}=${localVariable.value.value}`, 'Variable copied to clipboard')
    },
    {
      label: 'Delete',
      icon: 'lucide:trash',
      iconClass: 'text-red-500 dark:text-red-500',
      click: () => deleteVariable(localVariable.value.id, environment.value)
    }
  ]
]
</script>

<template>
  <UCard :ui="{ background: isSelected && showEdit ? 'ring ring-primary' : isSelected && !showEdit ? 'bg-gray-100 dark:bg-gray-800' : '' }">
    <div class="flex w-full items-center justify-between">
      <div class="flex w-full cursor-pointer flex-col gap-1" @click="emit('toggleSelected')">
        <h3 class="flex items-center gap-1 text-sm font-semibold sm:text-base">
          <span class="lg:hidden">
            {{ variable.key.length > 25 ? variable.key.slice(0, 25) + '...' : variable.key }}
          </span>
          <span class="hidden lg:block">{{ variable.key }}</span>
          <UTooltip text="Copy variable to clipboard">
            <UButton color="gray" variant="ghost" icon="lucide:clipboard-plus" @click.stop="copyToClipboard(variable.value, 'Variable value copied')" />
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
        <UDropdown :items>
          <UButton color="gray" variant="ghost" icon="heroicons:ellipsis-horizontal-20-solid" />
        </UDropdown>
      </div>
    </div>
    <div v-if="showEdit" class="flex flex-col gap-2 py-2">
      <hr class="border-1 border-black/10">
      <form class="flex flex-col gap-6" @submit.prevent="updateVariable(variableToUpdate)">
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
              <UCheckbox v-model="selectedEnvironment" value="preview" label="Staging" />
              <UCheckbox v-model="selectedEnvironment" value="development" label="Development" />
            </div>
          </div>
        </div>
        <hr class="border-1 border-black/10 dark:border-white/5">
        <div class="flex justify-between gap-4">
          <div>
            <UButton color="primary" type="submit" trailing :loading="updateLoading">
              Save
            </UButton>
            <UButton color="white" variant="soft" @click="showEdit = false">
              Cancel
            </UButton>
          </div>
          <UButton color="red" variant="soft" :loading="deleteLoading" @click="deleteVariable(variable.id, environment)">
            Delete
          </UButton>
        </div>
      </form>
    </div>
  </UCard>
</template>

<style scoped>

</style>
