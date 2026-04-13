<script setup lang="ts">
import type { VariableGroup } from '@types'

const route = useRoute()
const projectId = route.params.projectId as string

const groups = useVariableGroups(projectId)
const { loading, fetchGroups, createGroup, updateGroup, deleteGroup } = useVariableGroupsService()

const open = ref(false)
const newGroupName = ref('')
const newGroupDescription = ref('')
const editingGroup = ref<VariableGroup | null>(null)

if (!groups.value.length) fetchGroups()

async function handleCreate() {
  if (!newGroupName.value.trim()) return
  await createGroup(newGroupName.value, newGroupDescription.value || undefined)
  newGroupName.value = ''
  newGroupDescription.value = ''
}

function startEdit(group: VariableGroup) {
  editingGroup.value = { ...group }
}

async function handleUpdate() {
  if (!editingGroup.value) return
  await updateGroup(editingGroup.value.id, {
    name: editingGroup.value.name,
    description: editingGroup.value.description,
  })
  editingGroup.value = null
}

async function handleDelete(id: number) {
  await deleteGroup(id)
  if (editingGroup.value?.id === id) editingGroup.value = null
}
</script>

<template>
  <UModal v-model:open="open" title="Manage Groups" description="Organize your environment variables into groups">
    <UButton variant="ghost" icon="lucide:folder" label="Groups" @click="open = true" />

    <template #body>
      <div class="flex flex-col gap-4">
        <form class="flex flex-col gap-2" @submit.prevent="handleCreate">
          <div class="flex gap-2">
            <UInput
              v-model="newGroupName"
              placeholder="Group name"
              class="flex-1"
              required
            />
            <UButton type="submit" icon="lucide:plus" size="sm" :loading />
          </div>
          <UInput
            v-model="newGroupDescription"
            placeholder="Description (optional)"
            class="w-full"
          />
        </form>

        <Separator v-if="groups.length" />

        <div v-if="loading && !groups.length" class="flex flex-col gap-2">
          <USkeleton v-for="i in 3" :key="i" class="h-10 w-full" />
        </div>

        <div v-else class="flex flex-col gap-2">
          <div
            v-for="group in groups"
            :key="group.id"
            class="flex items-start gap-2 rounded-md border border-default p-3"
          >
            <template v-if="editingGroup && editingGroup.id === group.id">
              <div class="flex flex-1 flex-col gap-2">
                <UInput v-model="editingGroup.name" class="w-full" />
                <UInput v-model="editingGroup.description" placeholder="Description" class="w-full" />
                <div class="flex gap-1 justify-end">
                  <UButton variant="ghost" size="xs" @click="editingGroup = null">
                    Cancel
                  </UButton>
                  <UButton size="xs" @click="handleUpdate">
                    Save
                  </UButton>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate">
                  {{ group.name }}
                </p>
                <p v-if="group.description" class="text-xs text-muted truncate">
                  {{ group.description }}
                </p>
              </div>
              <div class="flex gap-1 shrink-0">
                <UButton variant="ghost" size="xs" icon="lucide:pencil" @click="startEdit(group)" />
                <UButton variant="ghost" size="xs" icon="lucide:trash-2" color="error" @click="handleDelete(group.id)" />
              </div>
            </template>
          </div>

          <p v-if="!groups.length && !loading" class="text-sm text-muted text-center py-4">
            No groups yet. Create one to organize your variables.
          </p>
        </div>
      </div>
    </template>
  </UModal>
</template>
