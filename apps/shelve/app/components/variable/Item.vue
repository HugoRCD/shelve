<script setup lang="ts">
import { type Environment, TeamRole, type Variable } from '@types'

const { variable, environments } = defineProps<{
  variable: Variable
  environments: Environment[]
  isSelected: boolean
}>()

const teamRole = useTeamRole()
const canDelete = computed(() => hasAccess(teamRole.value, TeamRole.OWNER))
const canUpdate = computed(() => hasAccess(teamRole.value, TeamRole.ADMIN))

const {
  updateLoading,
  deleteLoading,
  updateVariable,
  deleteVariable,
} = useVariablesService()

const emit = defineEmits(['toggleSelected'])
const localVariable = ref(variable)

const environmentsValues = ref<Record<string, string>>(
  Object.fromEntries(environments.map((env) => [env.id, variable.values.find((v) => v.environmentId === env.id)?.value ?? ''])),
)

watch(() => variable, (newValue) => {
  localVariable.value = newValue
  environmentsValues.value = Object.fromEntries(environments.map((env) => [env.id, newValue.values.find((v) => v.environmentId === env.id)?.value ?? '']))
})

const variableToUpdate = computed(() => ({
  ...localVariable.value,
  values: environments.map((env) => ({
    environmentId: env.id,
    value: environmentsValues.value[env.id] ?? '',
  }))
}))

const showEdit = ref(false)

const handleClick = (event: MouseEvent) => {
  emit('toggleSelected', event)
}

const items = computed(() => [
  [
    {
      label: 'Edit',
      icon: 'lucide:edit',
      onSelect: () => {
        showEdit.value = !showEdit.value
      },
    },
    ...environments.map((env) => ({
      label: `Copy ${env.name} variable`,
      icon: 'lucide:copy',
      onSelect: () => {
        copyToClipboard(`${localVariable.value.key}=${environmentsValues.value[env.id]}`, 'Variable copied to clipboard')
      },
    })),
  ],
  [
    {
      label: 'Delete',
      icon: 'lucide:trash-2',
      color: 'error',
      onSelect: () => {
        deleteVariable(variable.id)
      },
    },
  ]
])
</script>

<template>
  <UContextMenu :items>
    <UCard variant="subtle" :ui="{ root: isSelected && !showEdit ? 'bg-accented/60' : '' }">
      <div class="flex w-full select-none items-start justify-between">
        <div
          class="flex w-full flex-col gap-1"
          :class="{ 'cursor-pointer': !showEdit }"
          @click="showEdit ? null : handleClick($event)"
        >
          <h3 class="flex items-center gap-1 text-sm font-semibold sm:text-base">
            <span class="lg:hidden">
              {{ localVariable.key.length > 25 ? localVariable.key.slice(0, 25) + '...' : localVariable.key }}
            </span>
            <span class="hidden lg:block">{{ localVariable.key }}</span>
            <UTooltip text="Show Details">
              <UButton variant="ghost" icon="lucide:eye" @click.stop="showEdit = !showEdit" />
            </UTooltip>
          </h3>
          <div class="flex flex-col gap-1">
            <span v-for="env in environments" :key="env.id" class="flex items-center gap-1 text-xs font-normal text-muted">
              <UIcon v-if="environmentsValues[env.id]" name="lucide:check" class="size-4 text-success" />
              <UIcon v-else name="lucide:x" class="size-4 text-error" />
              {{ capitalize(env.name) }}
            </span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <p class="hidden text-right text-xs font-normal text-muted md:block">
            <DatePopover :date="variable.updatedAt" label="Last Updated" />
          </p>
        </div>
      </div>
      <div v-if="showEdit" class="flex flex-col gap-2 mt-4">
        <form class="flex flex-col gap-6 bg-default p-2 rounded-md" @submit.prevent="updateVariable(variableToUpdate)">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-default">
                  <th class="py-2 w-24 px-4 text-left text-sm font-medium text-muted">
                    Environment
                  </th>
                  <th class="py-2 px-4 text-left text-sm font-medium text-muted">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-default">
                  <td class="py-2 px-4 text-sm font-medium text-muted">
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
                <tr v-for="env in environments" :key="env.id" class="border-b border-default">
                  <td class="py-2 px-4 text-sm font-medium">
                    <UTooltip :text="`Copy env variables for ${env.name} environment`" :content="{ side: 'top' }">
                      <span
                        class="cursor-pointer transition-colors ease-in-out duration-300 text-muted hover:text-highlighted"
                        @click="copyToClipboard(`${localVariable.key}=${environmentsValues[env.id]}`, 'Variable copied to clipboard')"
                      >
                        {{ capitalize(env.name) }}
                      </span>
                    </UTooltip>
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
              v-if="canDelete"
              color="error"
              variant="ghost"
              :loading="deleteLoading"
              @click="deleteVariable(variable.id)"
            >
              Delete
            </UButton>
            <div class="flex justify-end w-full gap-2">
              <UButton variant="soft" @click="showEdit = false">
                Close
              </UButton>
              <UButton v-if="canUpdate" type="submit" trailing :loading="updateLoading" trailing-icon="lucide:save">
                Save
              </UButton>
            </div>
          </div>
        </form>
      </div>
    </UCard>
  </UContextMenu>
</template>
