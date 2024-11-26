<script setup lang="ts">
import { TeamRole, type Variable } from '@shelve/types'

type ProjectVariableProps = {
  refresh: () => Promise<void>
  variable: Variable
  projectId: string
  isSelected: boolean
}

const { refresh, variable, projectId } = defineProps<ProjectVariableProps>()
const teamEnv = useTeamEnv()
const teamRole = useTeamRole()

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
    value: environmentsValues.value[env.id] ?? '',
  }))
}))

const showEdit = ref(false)
</script>

<template>
  <UCard :ui="{ root: isSelected && !showEdit ? 'bg-neutral-100 dark:bg-neutral-800' : '' }">
    <div class="flex w-full items-start justify-between">
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
          <!--          <UTooltip text="Copy variable to clipboard">
            <UButton
              color="neutral"
              variant="ghost"
              icon="lucide:clipboard-plus"
              @click.stop="copyToClipboard(`${localVariable.key}=${localVariable.values}`, 'Variable copied to clipboard')"
            />
          </UTooltip>-->
          <UTooltip text="Show variable">
            <UButton color="neutral" variant="ghost" icon="lucide:eye" @click.stop="showEdit = !showEdit" />
          </UTooltip>
        </h3>
        <div class="flex flex-col gap-1">
          <span v-for="env in teamEnv" :key="env.id" class="flex items-center gap-1 text-xs font-normal text-neutral-500">
            <UIcon v-if="environmentsValues[env.id]" name="lucide:check" class="size-4 text-green-400" />
            <UIcon v-else name="lucide:x" class="size-4 text-red-400" />
            {{ capitalize(env.name) }}
          </span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <p class="hidden text-right text-xs font-normal text-neutral-500 md:block">
          Last updated: {{ new Date(variable.updatedAt).toLocaleDateString() }}
        </p>
      </div>
    </div>
    <div v-if="showEdit" class="flex flex-col gap-2 mt-4">
      <form class="flex flex-col gap-6 bg-neutral-50 dark:bg-neutral-950 p-2 rounded-md" @submit.prevent="updateVariable(variableToUpdate)">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b dark:border-neutral-800 border-neutral-300">
                <th class="py-2 w-24 px-4 text-left text-sm font-medium text-neutral-500">
                  Environment
                </th>
                <th class="py-2 px-4 text-left text-sm font-medium text-neutral-500">
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b dark:border-neutral-800 border-neutral-300">
                <td class="py-2 px-4 text-sm font-medium">
                  Key
                </td>
                <td class="py-2 px-4" colspan="2">
                  <VariableInput
                    v-model="localVariable.key"
                    type="key"
                    class="w-full"
                  />
                </td>
              </tr>
              <tr v-for="env in teamEnv" :key="env.id" class="border-b dark:border-neutral-800 border-neutral-300">
                <td class="py-2 px-4 text-sm font-medium flex items-start">
                  {{ capitalize(env.name) }}
                </td>
                <td class="py-2 px-4 w-full">
                  <VariableInput
                    v-model="environmentsValues[env.id]"
                    type="value"
                    class="w-full"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="flex justify-between gap-4">
          <UButton
            color="error"
            variant="ghost"
            :loading="deleteLoading"
            @click="deleteVariable(variable.id)"
          >
            Delete
          </UButton>
          <div class="flex gap-2">
            <UButton color="neutral" variant="soft" @click="showEdit = false">
              Cancel
            </UButton>
            <UButton color="primary" type="submit" trailing :loading="updateLoading" trailing-icon="lucide:save">
              Save
            </UButton>
          </div>
        </div>
      </form>
    </div>
  </UCard>
</template>

<style scoped></style>
