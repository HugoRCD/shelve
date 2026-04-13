<script setup lang="ts">
import type { Variable, VariableGroup } from '@types'

definePageMeta({
  title: 'Project',
})

const route = useRoute()
const projectId = route.params.projectId as string
const variables = useVariables(projectId)
const groups = useVariableGroups(projectId)

const { loading, fetchVariables } = useVariablesService()
const { fetchGroups } = useVariableGroupsService()

if (!variables.value) fetchVariables()
if (!groups.value.length) fetchGroups()

const project = useProject(projectId)
const teamEnv = useEnvironments()
const selectedVariables = useSelectedVariables(projectId)
const lastSelectedIndex = ref<number | null>(null)
const searchTerm = ref('')
const selectedEnvironment = ref([])
const order = ref('desc')
const collapseGroups = useCookie<boolean>('collapseGroups')
const openGroups = ref<Record<number, boolean>>({})

const environments = useEnvironments()

const items = ref(environments.value?.map((env) => ({ label: capitalize(env.name), value: env.id })) || [])

const filteredVariables = computed(() => {
  let filtered = variables.value || []

  if (searchTerm.value) {
    filtered = filtered.filter(variable =>
      variable.key.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  }

  if (selectedEnvironment.value.length) {
    filtered = filtered.filter(variable => {
      return variable.values.some(value => {
        return selectedEnvironment.value.some((env: { value: string }) => {
          return +env.value === value.environmentId && value.value !== ''
        })
      })
    })
  }

  filtered = filtered.sort((a, b) => {
    if (order.value === 'asc') {
      return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  return filtered
})

type GroupedVariables = {
  group: VariableGroup | null
  variables: Variable[]
}

const groupedVariables = computed<GroupedVariables[]>(() => {
  const vars = filteredVariables.value
  const result: GroupedVariables[] = []
  const groupMap = new Map<number, Variable[]>()
  const ungrouped: Variable[] = []

  for (const v of vars) {
    if (v.groupId && v.group) {
      const list = groupMap.get(v.groupId)
      if (list) list.push(v)
      else groupMap.set(v.groupId, [v])
    } else {
      ungrouped.push(v)
    }
  }

  const sortedGroups = [...groups.value].sort((a, b) => a.position - b.position)
  for (const group of sortedGroups) {
    const groupVars = groupMap.get(group.id)
    if (groupVars?.length) {
      result.push({ group, variables: groupVars })
    }
  }

  if (ungrouped.length) {
    result.push({ group: null, variables: ungrouped })
  }

  return result
})

const allCollapsed = computed(() => {
  const groupIds = groups.value.map(g => g.id)
  return groupIds.length > 0 && groupIds.every(id => !isGroupOpen(id))
})

function isGroupOpen(groupId: number) {
  if (openGroups.value[groupId] !== undefined) return openGroups.value[groupId]
  return !collapseGroups.value
}

function setGroupOpen(groupId: number, value: boolean) {
  openGroups.value[groupId] = value
}

function toggleAllGroups() {
  const newState = allCollapsed.value
  for (const group of groups.value) {
    openGroups.value[group.id] = newState
  }
}

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
    <div class="flex flex-col gap-2 sm:flex-row justify-between sm:items-center my-2">
      <div class="flex items-center gap-2">
        <UInput
          v-model="searchTerm"
          placeholder="Search variables..."
          icon="lucide:search"
          class="w-full"
        />
        <template v-if="selectedVariables.length">
          <LazyVariableSelector :variables />
        </template>
      </div>
      <div class="flex gap-1">
        <VariableGroupManager />
        <UTooltip v-if="groups.length" :text="allCollapsed ? 'Expand all groups' : 'Collapse all groups'">
          <UButton
            :icon="allCollapsed ? 'lucide:chevrons-down-up' : 'lucide:chevrons-up-down'"
            variant="soft"
            @click="toggleAllGroups"
          />
        </UTooltip>
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
    <div v-if="!loading" class="flex flex-col gap-6">
      <div v-for="{ group, variables: groupVars } in groupedVariables" :key="group?.id ?? 'ungrouped'">
        <template v-if="group">
          <UCollapsible
            :open="isGroupOpen(group.id)"
            :unmount-on-hide="false"
            @update:open="(val) => setGroupOpen(group.id, val)"
          >
            <button class="mb-2 flex w-full items-center gap-2 select-none" type="button">
              <UIcon
                name="lucide:chevron-right"
                class="size-4 text-muted transition-transform duration-200"
                :class="{ 'rotate-90': isGroupOpen(group.id) }"
              />
              <h3 class="text-sm font-semibold">
                {{ group.name }}
              </h3>
              <UBadge variant="subtle" size="sm">
                {{ groupVars.length }}
              </UBadge>
              <p v-if="group.description" class="text-xs text-muted">
                {{ group.description }}
              </p>
            </button>

            <template #content>
              <div class="flex flex-col gap-4 border-l-2 border-muted/30 pl-3 pr-1 ml-1.5 py-2">
                <div v-for="variable in groupVars" :key="variable.id">
                  <VariableItem
                    :variable
                    :environments
                    :is-selected="isVariableSelected(variable)"
                    @toggle-selected="(e) => toggleVariable(variable, e)"
                  />
                </div>
              </div>
            </template>
          </UCollapsible>
        </template>

        <template v-else>
          <div class="flex flex-col gap-4">
            <div v-for="variable in groupVars" :key="variable.id">
              <VariableItem
                :variable
                :environments
                :is-selected="isVariableSelected(variable)"
                @toggle-selected="(e) => toggleVariable(variable, e)"
              />
            </div>
          </div>
        </template>
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
