<script setup lang="ts">
import { type Environment, TeamRole } from '@types'
import { ConfirmModal } from '#components'

const teamRole = useTeamRole()
const team = useTeam()

const canDelete = computed(() => hasAccess(teamRole.value, TeamRole.OWNER))
const canUpdate = computed(() => hasAccess(teamRole.value, TeamRole.ADMIN))

const newEnv = ref('')

const columns = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
  }
]

const {
  loading,
  createLoading,
  updateLoading,
  environments,
  fetchEnvironments,
} = useEnvironmentsService()
const envService = useEnvironmentsService()

async function create() {
  await envService.createEnvironment(newEnv.value)
  await fetchEnvironments()
  newEnv.value = ''
}

async function updateEnv(env: Environment) {
  await envService.updateEnvironment(env)
  await fetchEnvironments()
}

async function deleteEnv(env: Environment) {
  await envService.deleteEnvironment(env)
  await fetchEnvironments()
}

const overlay = useOverlay()
const modal = overlay.create(ConfirmModal)

function openDeleteModal(env: Environment) {
  if (environments.value.length === 1) {
    toast.error('You cannot delete the last environment')
    return
  }
  modal.open({
    title: 'Are you sure?',
    description: `You are about to delete ${env.name}. This action cannot be undone and all variables associated with this environment will be lost.`,
    danger: true,
    onSuccess() {
      toast.promise(deleteEnv(env), {
        loading: 'Deleting environment...',
        success: 'Environment deleted successfully',
        error: 'Error deleting environment',
      })
    },
  })
}

function createEnvironment() {
  toast.promise(create(), {
    loading: 'Creating environment...',
    success: 'Environment created successfully',
    error: 'Error creating environment',
  })
}

function updateEnvironment(env: Environment) {
  toast.promise(updateEnv(env), {
    loading: 'Updating environment...',
    success: 'Environment updated successfully',
    error: 'Error updating environment',
  })
}
</script>

<template>
  <div class="flex flex-col">
    <form class="flex flex-col">
      <div style="--stagger: 1" data-animate class="flex justify-between">
        <div>
          <h2 class="text-base font-semibold leading-7">
            Environment Settings
          </h2>
          <p class="text-sm leading-6 text-(--ui-text-muted)">
            Create, update, and delete environments
          </p>
        </div>
        <form v-if="canUpdate" class="flex items-center gap-2" @submit.prevent="createEnvironment">
          <UInput v-model="newEnv" placeholder="New environment name" required />
          <UButton label="Create" :loading="createLoading" size="sm" type="submit" />
        </form>
      </div>
      <div style="--stagger: 2" data-animate class="mt-6">
        <UTable :data="environments" :columns :loading>
          <template #name-cell="{ row }">
            {{ capitalize(row.original.name) }}
          </template>
          <template #actions-cell="{ row }">
            <div class="flex gap-2">
              <UPopover v-if="canUpdate" arrow>
                <UButton variant="soft" icon="heroicons:pencil" />
                <template #content>
                  <UCard>
                    <form @submit.prevent="updateEnvironment(row.original)">
                      <UFormField label="Environment name">
                        <div class="flex items-center gap-2">
                          <UInput v-model="row.original.name" placeholder="New environment name" required />
                          <UButton label="Update" :loading="updateLoading" size="sm" type="submit" />
                        </div>
                      </UFormField>
                    </form>
                  </UCard>
                </template>
              </UPopover>
              <UButton
                v-if="canDelete"
                color="error"
                variant="soft"
                icon="heroicons:trash"
                @click="openDeleteModal(row.original)"
              />
            </div>
          </template>
        </UTable>
      </div>
    </form>
  </div>
</template>
