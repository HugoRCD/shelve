<script setup lang="ts">
import { type Environment, TeamRole } from '@shelve/types'
import { ConfirmModal } from '#components'
import { hasAccess } from '~/utils/hasAccess'

const teamEnv = useTeamEnv()
const teamId = useTeamId()
const teamRole = useTeamRole()

const {
  fetchTeams
} = useTeamsService()

const newEnv = ref('')
const loading = ref(false)
const updateLoading = ref(false)

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

async function create() {
  loading.value = true
  try {
    if (!newEnv.value) {
      toast.error('Environment name is required')
      return
    }
    if (teamEnv.value.find(env => env.name === newEnv.value)) {
      toast.error('Environment name already exists')
      return
    }
    await $fetch(`/api/teams/${teamId.value}/environments`, {
      method: 'POST',
      body: {
        name: newEnv.value
      },
    })
    await fetchTeams()
    newEnv.value = ''
  } catch (error) {
    console.error(error)
  }
  loading.value = false
}

async function updateEnv(env: Environment) {
  updateLoading.value = true
  await $fetch(`/api/teams/${teamId.value}/environments/${env.id}`, {
    method: 'PUT',
    body: {
      name: env.name
    },
  })
  await fetchTeams()
  updateLoading.value = false
}

async function deleteEnv(environments: Environment) {
  await $fetch(`/api/teams/${teamId.value}/environments/${environments.id}`, {
    method: 'DELETE',
  })
  await fetchTeams()
}

const modal = useModal()
function openDeleteModal(env: Environment) {
  if (teamEnv.value.length === 1) {
    toast.error('You cannot delete the last environment')
    return
  }
  modal.open(ConfirmModal, {
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
          <p class="text-sm leading-6 text-neutral-500">
            Create, update, and delete environments
          </p>
        </div>
        <form class="flex items-center gap-2" @submit.prevent="createEnvironment">
          <UInput v-model="newEnv" placeholder="New environment name" required />
          <UButton label="Create" color="primary" :loading size="sm" type="submit" />
        </form>
      </div>
      <div style="--stagger: 2" data-animate class="mt-6">
        <UTable :data="teamEnv" :columns>
          <template #name-cell="{ row }">
            {{ capitalize(row.original.name) }}
          </template>
          <template #actions-cell="{ row }">
            <div class="flex gap-2">
              <UPopover arrow>
                <UButton color="primary" variant="soft" icon="heroicons:pencil" />
                <template #content>
                  <UCard>
                    <form @submit.prevent="updateEnvironment(row.original)">
                      <UFormField label="Environment name">
                        <div class="flex items-center gap-2">
                          <UInput v-model="row.original.name" placeholder="New environment name" required />
                          <UButton label="Update" color="primary" :loading="updateLoading" size="sm" type="submit" />
                        </div>
                      </UFormField>
                    </form>
                  </UCard>
                </template>
              </UPopover>
              <UButton v-if="hasAccess(teamRole, TeamRole.ADMIN)" color="error" variant="soft" icon="heroicons:trash" @click="openDeleteModal(row.original)" />
            </div>
          </template>
        </UTable>
      </div>
    </form>
  </div>
</template>
