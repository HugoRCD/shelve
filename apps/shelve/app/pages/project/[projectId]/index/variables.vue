<script setup lang="ts">
import type { Variable } from '@shelve/types'

const { projectId } = useRoute().params as { projectId: string }

const { data: variables, status, refresh } = useFetch<Variable[]>(`/api/variables/project/${projectId}`, {
  method: 'GET',
  watch: false,
})

const selectedVariables = ref<Variable[]>([])

const toggleVariable = (variable: Variable) => {
  if (!isVariableSelected(variable)) {
    selectedVariables.value.push(variable)
  } else {
    selectedVariables.value = selectedVariables.value.filter((v) => v.id !== variable.id)
  }
}

const isVariableSelected = (variable: Variable) => {
  return selectedVariables.value.some((v) => v.id === variable.id)
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <ProjectCreateVariables v-if="projectId && variables" :variables :project-id :refresh />
    <VariableSelector v-model="selectedVariables" @refresh="refresh" />
    <div v-if="status !== 'pending'" class="flex flex-col gap-4">
      <div v-for="variable in variables" :key="variable.id">
        <VariableItem
          :project-id
          :variable
          :refresh
          :is-selected="isVariableSelected(variable)"
          @toggle-selected="toggleVariable(variable)"
        />
      </div>
    </div>
    <div v-else class="flex flex-col gap-4">
      <div v-for="variable in 5" :key="variable">
        <UCard class="h-16">
          <div class="space-y-2">
            <USkeleton class="h-4 w-2/4" />
            <USkeleton class="h-4 w-1/4" />
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
