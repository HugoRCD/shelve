<script setup lang="ts">
import type { Variable } from '@shelve/types'

type ProjectVariableProps = {
  refresh: () => Promise<void>
  variable: Variable
  projectId: string
  isSelected: boolean
}

const { refresh, variable, projectId } = defineProps<ProjectVariableProps>()
const teamEnv = useTeamEnv()

const {
  updateLoading,
  deleteLoading,
  updateVariable,
  deleteVariable,
} = useVariables(refresh, projectId)

const emit = defineEmits(['toggleSelected'])
const localVariable = ref(variable)

const environmentsValues = ref<Record<string, string>>(
  Object.fromEntries(teamEnv.value.map((env) => [env.id, variable.values.find((v) => v.environmentId === env.id)?.value ?? ''])),
)

const variableToUpdate = computed(() => ({
  ...localVariable.value,
  values: teamEnv.value.map((env) => ({
    environmentId: env.id,
    value: environmentsValues.value[env.id],
  })).filter((v) => v.value),
}))

const showEdit = ref(false)
</script>

<template>
  <UCard :ui="{ root: isSelected && !showEdit ? 'bg-neutral-100 dark:bg-neutral-800' : '' }">
    <div class="flex w-full items-center justify-between">
      <div
        class="flex w-full flex-col gap-1"
        :class="{ 'cursor-pointer': !showEdit }"
        @click="showEdit ? null : emit('toggleSelected')"
      >
        <h3 class="flex items-center gap-1 text-sm font-semibold sm:text-base">
          <span class="lg:hidden">
            {{ localVariable.key.length > 25 ? localVariable.key.slice(0, 25) + '...' : localVariable.key }}
          </span>
          <span class="hidden lg:block">{{ localVariable.key }}</span>
          <UTooltip text="Copy variable to clipboard">
            <UButton
              color="neutral"
              variant="ghost"
              icon="lucide:clipboard-plus"
              @click.stop="copyToClipboard(`${localVariable.key}=${localVariable.values}`, 'Variable copied to clipboard')"
            />
          </UTooltip>
          <UTooltip text="Show variable">
            <UButton color="neutral" variant="ghost" icon="lucide:eye" @click.stop="showEdit = !showEdit" />
          </UTooltip>
        </h3>
        <span class="text-xs font-normal text-neutral-500">
          <!--          {{ localVariable.environments.map((env) => capitalize(env.name)).join(', ') }}-->
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
        {{ variableToUpdate }}
        {{ environmentsValues }}
        <div class="flex flex-col gap-8 sm:flex-row">
          <div class="flex flex-col gap-4 w-full">
            <FormGroup v-model="localVariable.key" label="Key" />
            <FormGroup
              v-for="env in teamEnv"
              :key="env.id"
              v-model="environmentsValues[env.id]"
              :label="capitalize(env.name)"
              type="textarea"
            />
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
          <UButton
            color="error"
            variant="soft"
            :loading="deleteLoading"
            @click="deleteVariable(variable.id)"
          >
            Delete
          </UButton>
        </div>
      </form>
    </div>
  </UCard>
</template>

<style scoped></style>
