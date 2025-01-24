<script setup lang="ts">
import type { Variable } from '~~/packages/types'
import { ConfirmModal } from '#components'

const selectedVariables = defineModel<Variable[]>({ required: true })

const { deleteVariables } = useVariablesService()

const loading = ref(false)
const modal = useModal()
const route = useRoute()
const teamEnv = useEnvironments()

function openDeleteModal() {
  modal.open(ConfirmModal, {
    title: 'Are you sure?',
    description: `You are about to delete ${selectedVariables.value.length} variable${selectedVariables.value.length > 1 ? 's' : '' }, this action cannot be undone`,
    danger: true,
    onSuccess() {
      toast.promise(deleteSelectedVariables(), {
        loading: 'Deleting variables...',
        success: 'Variables have been deleted',
        error: 'Failed to delete variables',
      })
    },
  })
}

async function deleteSelectedVariables() {
  loading.value = true
  const ids = selectedVariables.value.map((v: Variable) => v.id)
  await deleteVariables(ids)
  selectedVariables.value = []
  loading.value = false
}
</script>

<template>
  <div>
    <Transition name="bezier" mode="out-in">
      <div v-if="selectedVariables.length > 0" class="absolute bottom-4 left-1/2 z-20 -translate-x-1/2">
        <div class="dark flex items-center text-neutral-300 gap-4 rounded-md border px-5 py-1.5 border-neutral-800 bg-neutral-950 shadow-lg">
          <span class="text-nowrap text-sm font-semibold">
            {{ selectedVariables.length }} variable{{ selectedVariables.length > 1 ? 's' : '' }} selected
          </span>
          <div class="flex gap-2">
            <VariableGithubSync :selected-variables />
            <UPopover mode="hover" arrow>
              <UButton icon="lucide:clipboard-plus" variant="ghost" />
              <template #content>
                <UCard>
                  <div class="flex flex-col gap-2">
                    <UTooltip v-for="env in teamEnv" :key="env.id" :text="`Copy variables for ${env.name}`" :content="{ side: 'right' }">
                      <UButton :disabled="loading" :label="capitalize(env.name)" variant="soft" @click="copyEnv(selectedVariables, env.id)" />
                    </UTooltip>
                  </div>
                </UCard>
              </template>
            </UPopover>
            <UTooltip text="Delete selected variables">
              <UButton color="error" variant="ghost" icon="heroicons:trash" :loading @click="openDeleteModal" />
            </UTooltip>
            <UTooltip text="Clear selection">
              <UButton variant="ghost" icon="lucide:x" @click="selectedVariables = []" />
            </UTooltip>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
