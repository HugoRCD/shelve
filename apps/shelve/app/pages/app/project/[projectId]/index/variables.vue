<script setup lang="ts">
import type { Variable } from '@shelve/types'
import { ConfirmModal } from '#components'

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

const modal = useModal()

function openDeleteModal() {
  modal.open(ConfirmModal, {
    title: 'Are you sure?',
    description: `You are about to delete ${selectedVariables.value.length} variable${selectedVariables.value.length > 1 ? 's' : '' }, this action cannot be undone`,
    danger: true,
    onSuccess() {
      toast.promise(deleteVariables(), {
        loading: 'Deleting variables...',
        success: 'Variables have been deleted',
        error: 'Failed to delete variables',
      })
    },
  })
}

async function deleteVariables() {
  loading.value = true
  const ids = selectedVariables.value.map((v) => v.id)
  try {
    await $fetch(`/api/variable`, {
      method: 'DELETE',
      body: {
        variables: ids,
      }
    })
  } catch (error) {
    /* empty */
  }
  selectedVariables.value = []
  await refresh()
  loading.value = false
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <ProjectCreateVariables :variables :project-id :refresh />
    <Transition name="fade" mode="out-in">
      <div v-if="selectedVariables.length > 0" class="absolute bottom-4 left-1/2 z-20 -translate-x-1/2">
        <div class="flex items-center gap-4 rounded-full border border-neutral-200 bg-white px-5 py-1.5 shadow-md dark:border-neutral-700 dark:bg-neutral-800">
          <span class="text-nowrap text-sm font-semibold text-neutral-900 dark:text-neutral-300">
            {{ selectedVariables.length }} variable{{ selectedVariables.length > 1 ? 's' : '' }} selected
          </span>
          <div class="flex gap-2">
            <UTooltip text="Copy selected variables (dev) to clipboard">
              <UButton color="neutral" variant="soft" icon="lucide:clipboard-plus" @click="copyEnv(selectedVariables, 'development')" />
            </UTooltip>
            <UTooltip text="Delete selected variables">
              <UButton color="error" variant="ghost" icon="heroicons:trash" :loading @click="openDeleteModal" />
            </UTooltip>
            <UTooltip text="Clear selection">
              <UButton color="neutral" variant="ghost" icon="lucide:x" @click="selectedVariables = []" />
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
