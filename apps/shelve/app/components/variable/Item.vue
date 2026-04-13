<script setup lang="ts">
import { type Environment, TeamRole, type Variable } from '@types'

const { variable, environments, isSelected } = defineProps<{
  variable: Variable
  environments: Environment[]
  isSelected: boolean
}>()

const route = useRoute()
const projectId = route.params.projectId as string

const teamRole = useTeamRole()
const canDelete = computed(() => hasAccess(teamRole.value, TeamRole.OWNER))
const canUpdate = computed(() => hasAccess(teamRole.value, TeamRole.ADMIN))

const {
  updateLoading,
  deleteLoading,
  updateVariable,
  deleteVariable,
  bulkAssignGroup,
} = useVariablesService()

const groups = useVariableGroups(projectId)
const selectedVariables = useSelectedVariables(projectId)

const targetIds = computed(() => {
  if (isSelected && selectedVariables.value.length > 1) {
    return selectedVariables.value.map(v => v.id)
  }
  return [variable.id]
})

const emit = defineEmits(['toggleSelected'])
const localVariable = ref(variable)
const localDescription = ref(variable.description || '')
const localGroupId = ref(variable.groupId || undefined)

const environmentsValues = ref<Record<string, string>>(
  Object.fromEntries(environments.map((env) => [env.id, variable.values.find((v) => v.environmentId === env.id)?.value ?? ''])),
)

watch(() => variable, (newValue) => {
  localVariable.value = newValue
  localDescription.value = newValue.description || ''
  localGroupId.value = newValue.groupId || undefined
  environmentsValues.value = Object.fromEntries(environments.map((env) => [env.id, newValue.values.find((v) => v.environmentId === env.id)?.value ?? '']))
})

const groupItems = computed(() =>
  [{ label: 'None', value: undefined }, ...groups.value.map((g) => ({ label: g.name, value: g.id }))]
)

const variableToUpdate = computed(() => ({
  ...localVariable.value,
  description: localDescription.value || null,
  groupId: localGroupId.value || null,
  values: environments.map((env) => ({
    environmentId: env.id,
    value: environmentsValues.value[env.id] ?? '',
  }))
}))

const showEdit = ref(false)

const handleClick = (event: MouseEvent) => {
  emit('toggleSelected', event)
}

const assignGroupLabel = computed(() => {
  const count = targetIds.value.length
  return count > 1 ? `Assign ${count} variables to group` : 'Assign to group'
})

const assignGroupChildren = computed(() => [
  ...(variable.groupId
    ? [
      {
        label: 'None',
        icon: 'lucide:x',
        onSelect: () => bulkAssignGroup(targetIds.value, null),
      },
    ]
    : []),
  ...groups.value.map((g) => ({
    label: g.name,
    icon: variable.groupId === g.id ? 'lucide:check' : 'lucide:folder',
    onSelect: () => bulkAssignGroup(targetIds.value, variable.groupId === g.id ? null : g.id),
  })),
])

const items = computed(() => [
  [
    {
      label: 'Edit',
      icon: 'lucide:edit',
      onSelect: () => {
        showEdit.value = !showEdit.value
      },
    },
    ...(groups.value.length
      ? [
        {
          label: assignGroupLabel.value,
          icon: 'lucide:folder-plus',
          children: assignGroupChildren.value,
        },
      ]
      : []),
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
      <div
        class="flex w-full select-none items-center justify-between gap-4"
        :class="{ 'cursor-pointer': !showEdit }"
        @click="showEdit ? null : handleClick($event)"
      >
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <p class="truncate text-sm font-semibold">
              {{ localVariable.key }}
            </p>
            <UBadge v-if="variable.group" variant="subtle" size="sm" color="neutral">
              <UIcon name="lucide:folder" class="size-3" />
              {{ variable.group.name }}
            </UBadge>
          </div>
          <div class="mt-1 flex items-center gap-2">
            <span
              v-for="env in environments"
              :key="env.id"
              class="flex items-center gap-1 text-xs text-muted"
            >
              <span
                class="size-1.5 rounded-full"
                :class="environmentsValues[env.id] ? 'bg-success' : 'bg-error'"
              />
              {{ capitalize(env.name) }}
            </span>
          </div>
        </div>
        <div class="flex shrink-0 items-center gap-3">
          <p class="hidden text-xs tabular-nums text-muted md:block">
            <DatePopover :date="variable.updatedAt" label="Last Updated" />
          </p>
          <UButton
            variant="ghost"
            icon="lucide:chevron-right"
            size="sm"
            :ui="{ leadingIcon: showEdit ? 'rotate-90 transition-transform duration-200' : 'transition-transform duration-200' }"
            @click.stop="showEdit = !showEdit"
          />
        </div>
      </div>
      <div v-if="showEdit" class="mt-4 flex flex-col gap-2">
        <form class="flex flex-col gap-6 rounded-md bg-default p-2" @submit.prevent="updateVariable(variableToUpdate)">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-default">
                  <th class="w-24 px-4 py-2 text-left text-sm font-medium text-muted">
                    Environment
                  </th>
                  <th class="px-4 py-2 text-left text-sm font-medium text-muted">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-default">
                  <td class="px-4 py-2 text-sm font-medium text-muted">
                    Key
                  </td>
                  <td class="px-4 py-2" colspan="2">
                    <VariableInput v-model="localVariable.key" type="key" class="w-full" />
                  </td>
                </tr>
                <tr class="border-b border-default">
                  <td class="px-4 py-2 text-sm font-medium text-muted">
                    Description
                  </td>
                  <td class="px-4 py-2" colspan="2">
                    <UInput v-model="localDescription" placeholder="Optional description" class="w-full" />
                  </td>
                </tr>
                <tr class="border-b border-default">
                  <td class="px-4 py-2 text-sm font-medium text-muted">
                    Group
                  </td>
                  <td class="px-4 py-2" colspan="2">
                    <USelectMenu v-model="localGroupId" :items="groupItems" value-key="value" class="w-full" placeholder="No group" />
                  </td>
                </tr>
                <tr v-for="env in environments" :key="env.id" class="border-b border-default">
                  <td class="px-4 py-2 text-sm font-medium">
                    <UTooltip :text="`Copy env variables for ${env.name} environment`" :content="{ side: 'top' }">
                      <span
                        class="cursor-pointer text-muted transition-colors duration-300 ease-in-out hover:text-highlighted"
                        @click="copyToClipboard(`${localVariable.key}=${environmentsValues[env.id]}`, 'Variable copied to clipboard')"
                      >
                        {{ capitalize(env.name) }}
                      </span>
                    </UTooltip>
                  </td>
                  <td class="w-full px-4 py-2">
                    <VariableInput v-model="environmentsValues[env.id]" type="value" class="w-full" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="flex justify-between gap-4">
            <UButton v-if="canDelete" color="error" variant="ghost" :loading="deleteLoading" @click="deleteVariable(variable.id)">
              Delete
            </UButton>
            <div class="flex w-full justify-end gap-2">
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
