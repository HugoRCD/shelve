<script setup lang="ts">
import type { Variable } from '@types'

const route = useRoute()
const projectId = route.params.projectId as string
const variables = useVariables(projectId)

const { loading, fetchVariables } = useVariablesService()

if (!variables.value) fetchVariables()

const project = useProject(projectId)
const teamEnv = useEnvironments()
const selectedVariables = useSelectedVariables(projectId)
const lastSelectedIndex = ref<number | null>(null)
const searchTerm = ref('')
const selectedEnvironment = ref([])
const order = ref('desc')

const environments = useEnvironments()

const items = ref(environments.value?.map((env) => ({ label: capitalize(env.name), value: env.id })) || [])

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
        return selectedEnvironment.value.some((env: { value: string }) => {
          return +env.value === value.environmentId && value.value !== ''
        })
      })
    })
  }

  // Sort by updated date
  filtered = filtered.sort((a, b) => {
    if (order.value === 'asc') {
      return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  return filtered
})

const toggleVariable = (variable: Variable, event?: MouseEvent) => {
  const filteredIndex = filteredVariables.value.findIndex(v => v.id === variable.id)

  if (event?.shiftKey && lastSelectedIndex.value !== null) {
    const startIndex = Math.min(lastSelectedIndex.value, filteredIndex)
    const endIndex = Math.max(lastSelectedIndex.value, filteredIndex)
    const newSelection = filteredVariables.value.slice(startIndex, endIndex + 1)
    selectedVariables.value = Array.from(
      new Map(
        [...selectedVariables.value, ...newSelection].map(item => [item.id, item])
      ).values()
    )
  } else {
    if (!isVariableSelected(variable)) {
      selectedVariables.value.push(variable)
    } else {
      selectedVariables.value = selectedVariables.value.filter((v) => v.id !== variable.id)
    }
    lastSelectedIndex.value = filteredIndex
  }
}

const isVariableSelected = (variable: Variable) => {
  return selectedVariables.value.some((v) => v.id === variable.id)
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <VariableCreate v-if="environments && environments.length" :environments />
    <div class="flex flex-col gap-2 sm:flex-row justify-between sm:items-center mt-2">
      <div class="flex items-center gap-2">
        <UInput
          v-model="searchTerm"
          placeholder="Search variables..."
          icon="lucide:search"
          class="w-full"
        />
        <template v-if="selectedVariables.length">
          <LazyVariableSelector :variables="selectedVariables" />
        </template>
      </div>
      <div class="flex gap-1">
        <UTooltip :text="order === 'asc' ? 'Oldest first' : 'Newest first'">
          <UButton
            icon="lucide:arrow-down"
            variant="soft"
            :ui="{ leadingIcon: order === 'asc' ? 'rotate-180 duration-300 transition-transform' : 'duration-300 transition-transform' }"
            @click="order === 'asc' ? (order = 'desc') : (order = 'asc')"
          />
        </UTooltip>
        <USelectMenu v-model="selectedEnvironment" multiple :items class="w-full" placeholder="Select environment" />
      </div>
    </div>
    <div v-if="!loading" class="flex flex-col gap-4">
      <div v-for="variable in filteredVariables" :key="variable.id">
        <VariableItem
          :variable
          :environments
          :is-selected="isVariableSelected(variable)"
          @toggle-selected="(e) => toggleVariable(variable, e)"
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
    <!--    <Teleport defer to="#command-items">
      <VariableActionsToggleSelection />
    </Teleport>-->
  </div>
</template>
