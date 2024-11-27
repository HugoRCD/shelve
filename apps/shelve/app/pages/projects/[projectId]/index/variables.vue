<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Variable } from '@shelve/types'

const { projectId } = useRoute().params as { projectId: string }
const { data: variables, status, refresh } = useFetch<Variable[]>(`/api/variables/project/${projectId}`, {
  method: 'GET',
  watch: false,
})

const teamEnv = useTeamEnv()
const selectedVariables = ref<Variable[]>([])
const searchTerm = ref('')
const selectedEnvironment = ref([])

const items = ref(teamEnv.value.map((env) => ({ label: capitalize(env.name), value: env.id })) || [])

const filteredVariables = computed(() => {
  let filtered = variables.value || []

  // Search functionality
  if (searchTerm.value) {
    filtered = filtered.filter(variable =>
      variable.key.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  }

  // Filter by environment
  if (selectedEnvironment.value.length) {
    filtered = filtered.filter(variable => {
      return variable.values.some(value => {
        return selectedEnvironment.value.some(env => {
          return env.value === value.environmentId && value.value !== ''
        })
      })
    })
  }

  return filtered
})

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
    <div class="flex justify-between items-center mt-2">
      <UInput
        v-model="searchTerm"
        placeholder="Search variables..."
        class="w-1/3"
      />
      <USelectMenu v-model="selectedEnvironment" multiple :items class="w-1/3" placeholder="Select environment" />
    </div>
    <VariableSelector v-model="selectedVariables" @refresh="refresh" />
    <div v-if="status !== 'pending'" class="flex flex-col gap-4">
      <div v-for="variable in filteredVariables" :key="variable.id">
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
