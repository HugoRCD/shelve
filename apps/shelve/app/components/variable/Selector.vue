<script setup lang="ts">
import type { Variable } from '@shelve/types'
import { ConfirmModal } from '#components'

const selectedVariables = defineModel<Variable[]>({ required: true })

const { deleteVariables } = useVariablesService()

const loading = ref(false)
const modal = useModal()
const route = useRoute()
const teamEnv = useEnvironments()

const projectId = route.params.projectId as string
const project = useProject(projectId)

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

const open = ref(false)
const selectedEnvironment = ref(teamEnv.value[0]?.id)
const githubUrl = 'https://github.com/'
const selectedRepo = ref(project.value?.repository?.replace(githubUrl, '') || 'HugoRCD/shelve')

const variablesToSend = computed(() => {
  return selectedVariables.value.map((v: Variable) => {
    return {
      key: v.key,
      value: v.values.find((v: any) => v.environmentId === selectedEnvironment.value)?.value,
    }
  }).filter((v: any) => v.value)
})

async function sendToGithub() {
  try {
    await $fetch(`/api/github/secrets`, {
      method: 'POST',
      body: {
        variables: variablesToSend.value,
        repository: sanitizeGithubUrl(selectedRepo.value),
      }
    })
    toast.success('Variables have been sent to Github')
  } catch (error) {
    toast.error('Failed to send variables to Github')
  }
  open.value = false
  selectedVariables.value = []
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
            <UTooltip text="Send selected variables to Github">
              <UButton icon="simple-icons:github" variant="ghost" @click="open = true" />
            </UTooltip>
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
    <UModal v-model:open="open" title="Send to Github">
      <template #content>
        <UCard>
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-2">
              <UIcon name="simple-icons:github" class="size-6" />
              <div class="flex flex-col">
                <span class="font-semibold">Send selected variables to Github</span>
                <span class="text-sm text-neutral-300">Select the environment you want to send the variables to</span>
              </div>
            </div>
            <USeparator />
            <div>
              <div class="flex flex-col gap-2">
                <UInput v-model="selectedRepo" :placeholder="sanitizeGithubUrl(selectedRepo)" disabled />
              </div>
            </div>
            <div>
              <div class="flex flex-col gap-2">
                <span class="text-neutral-300">Select environment:</span>
                <URadioGroup
                  v-model="selectedEnvironment"
                  :items="teamEnv"
                  value-key="id"
                  label-key="name"
                  :default-value="teamEnv[0]?.id"
                >
                  <template #label="{ item }">
                    <span>{{ capitalize(item.name) }}</span>
                  </template>
                </URadioGroup>
              </div>
            </div>
            <UButton loading-auto label="Send" block :disabled="variablesToSend.length === 0" @click="sendToGithub()" />
          </div>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
