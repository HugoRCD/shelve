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

const selectedEnvironment = ref({
  production: variable.environment.includes('production'),
  preview: variable.environment.includes('preview'),
  development: variable.environment.includes('development'),
})

const environment = computed(() => Object.keys(selectedEnvironment.value).filter(key => selectedEnvironment.value[key]).join('|'))

const variableToUpdate = computed(() => {
  return {
    ...localVariable,
    environment: environment.value
  }
})

const showEdit = ref(false)
</script>

<template>
  <UCard :ui="{ root: isSelected && !showEdit ? 'bg-neutral-100 dark:bg-neutral-800' : '' }">
    <div class="flex w-full items-center justify-between">
      <div class="flex w-full flex-col gap-1" :class="{ 'cursor-pointer': !showEdit }" @click="showEdit ? null : emit('toggleSelected')">
        <h3 class="flex items-center gap-1 text-sm font-semibold sm:text-base">
          <span class="lg:hidden">
            {{ variable.key.length > 25 ? variable.key.slice(0, 25) + '...' : variable.key }}
          </span>
          <span class="hidden lg:block">{{ variable.key }}</span>
          <UTooltip text="Copy variable to clipboard">
            <UButton color="neutral" variant="ghost" icon="lucide:clipboard-plus" @click.stop="copyToClipboard(`${localVariable.key}=${localVariable.value}`, 'Variable copied to clipboard')" />
          </UTooltip>
          <UTooltip text="Show variable">
            <UButton color="neutral" variant="ghost" icon="lucide:eye" @click.stop="showEdit = !showEdit" />
          </UTooltip>
        </h3>
        <span class="text-xs font-normal text-neutral-500">
          {{ capitalize(variable.environment.split("|").join(", ")) }}
        </span>
      </div>
      <div class="flex items-center gap-2">
        <p class="hidden text-right text-xs font-normal text-neutral-500 md:block">
          Last updated: {{ new Date(variable.updatedAt).toLocaleDateString() }}
        </p>
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
              <UCheckbox v-model="selectedEnvironment.production" name="production" label="Production" />
              <UCheckbox v-model="selectedEnvironment.preview" name="preview" label="Staging" />
              <UCheckbox v-model="selectedEnvironment.development" name="development" label="Development" />
            </div>
          </div>
        </div>
        <hr class="border-1 border-black/10 dark:border-white/5">
        <div class="flex justify-between gap-4">
          <div class="flex gap-2">
            <UButton color="primary" type="submit" trailing :loading="updateLoading">
              Save
            </UButton>
            <UButton color="neutral" variant="soft" @click="showEdit = false">
              Cancel
            </UButton>
          </div>
          <UButton color="error" variant="soft" :loading="deleteLoading" @click="deleteVariable(variable.id, environment)">
            Delete
          </UButton>
        </div>
      </form>
    </div>
  </UCard>
</template>

<style scoped>

</style>
