<script setup lang="ts">
import type { Variable } from '@shelve/types'

const { projectId } = useRoute().params

const { data: variables, status, refresh } = useFetch<Variable[]>(`/api/variable/project/${projectId}`, {
  method: 'GET',
  watch: false,
})

const loading = ref(false)
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

async function deleteVariables() {
  if (!confirm('Are you sure you want to delete these variables?')) return
  loading.value = true
  const ids = selectedVariables.value.map((v) => v.id)
  try {
    const response = await $fetch(`/api/variable`, {
      method: 'DELETE',
      body: {
        variables: ids,
      }
    })
    toast.success(response.message)
  } catch (error) {
    toast.error('Couldn\'t delete variables')
  }
  selectedVariables.value = []
  await refresh()
  loading.value = false
}
</script>

<template>
  <div class="mt-6 flex flex-col gap-4">
    <ProjectCreateVariables :variables :project-id :refresh />
    <Transition name="fade" mode="out-in">
      <div v-if="selectedVariables.length > 0" class="absolute bottom-4 left-1/2 z-20 -translate-x-1/2">
        <div class="flex items-center gap-4 rounded-full border border-neutral-200 bg-white px-5 py-1.5 shadow-md dark:border-neutral-700 dark:bg-neutral-800">
          <span class="text-nowrap text-sm font-semibold text-gray-900 dark:text-gray-300">
            {{ selectedVariables.length }} variable{{ selectedVariables.length > 1 ? 's' : '' }} selected
          </span>
          <div class="flex gap-2">
            <UTooltip
              text="Copy selected variables (dev) to clipboard"
              @click="copyEnv(selectedVariables, 'development')"
            >
              <UButton color="gray" variant="ghost" icon="lucide:clipboard-plus" />
            </UTooltip>
            <UTooltip text="Delete selected variables">
              <UButton color="red" variant="ghost" icon="heroicons:trash" :loading @click="deleteVariables" />
            </UTooltip>
            <UTooltip text="Clear selection">
              <UButton color="gray" variant="ghost" icon="lucide:x" @click="selectedVariables = []" />
            </UTooltip>
          </div>
        </div>
      </div>
    </Transition>
    <div v-if="status !== 'pending'" class="flex flex-col gap-4">
      <div v-for="variable in variables" :key="variable.id">
        <ProjectVariableItem
          :variables
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
