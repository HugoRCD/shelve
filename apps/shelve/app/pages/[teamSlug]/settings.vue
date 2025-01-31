<script setup lang="ts">
import { TeamRole } from '@types'
import { ConfirmModal } from '#components'

const { updateTeam, deleteTeam } = useTeamsService()

const updateLoading = ref(false)

const team = useTeam()
const teamRole = useTeamRole()
const newSlug = ref(team.value.slug)

const canDelete = computed(() => hasAccess(teamRole.value, TeamRole.OWNER))
const canUpdate = computed(() => hasAccess(teamRole.value, TeamRole.ADMIN))

function updateCurrentTeam() {
  updateLoading.value = true
  toast.promise(updateTeam({ ...team.value, slug: newSlug.value }), {
    loading: 'Updating team...',
    success: 'Team updated successfully',
    error: (data: any) => data.statusMessage || 'Error updating team',
  })
  updateLoading.value = false
}

const modal = useModal()
function deleteCurrentTeam() {
  modal.open(ConfirmModal, {
    title: 'Delete Team',
    description: 'Are you sure you want to delete this team?',
    danger: true,
    onSuccess: () => {
      toast.promise(deleteTeam(), {
        loading: 'Deleting team...',
        success: 'Team deleted successfully',
        error: 'Error deleting team',
      })
    },
  })
}

const open = ref(false)
</script>

<template>
  <div class="flex flex-col">
    <form v-if="team" class="flex flex-col" @submit.prevent="updateCurrentTeam">
      <div style="--stagger: 1" data-animate class="flex justify-between">
        <div class="flex items-center gap-4">
          <NuxtImg :src="team.logo" class="size-10 rounded-full" />
          <div>
            <h2 class="text-base font-semibold leading-7">
              Team Settings
            </h2>
            <p class="text-sm leading-6 text-neutral-500">
              Manage team settings
            </p>
          </div>
        </div>
      </div>
      <div style="--stagger: 2" data-animate class="mt-6 flex flex-col gap-4">
        <div class="max-w-xs">
          <FormGroup v-model="team.name" label="Name" :disabled="!canUpdate" />
        </div>
        <div class="max-w-sm">
          <UFormField class="max-w-xs" label="Slug">
            <UButtonGroup class="w-full">
              <UButton
                color="neutral"
                variant="subtle"
                label="shelve.cloud/"
              />
              <UInput v-model="newSlug" class="w-full" :disabled="!canUpdate" />
              <UTooltip text="Copy to clipboard">
                <UButton color="neutral" variant="subtle" icon="lucide:clipboard" @click="copyToClipboard(team.slug)" />
              </UTooltip>
            </UButtonGroup>
          </UFormField>
          <p class="text-xs mt-1 text-neutral-500">
            This is the unique identifier for your team (used by the CLI)
          </p>
        </div>
        <div class="w-full">
          <FormGroup v-model="team.logo" label="Logo" :disabled="!canUpdate" />
        </div>
      </div>
      <div style="--stagger: 4" data-animate class="mt-6 flex items-center justify-between gap-2">
        <UButton v-if="canUpdate" type="submit" :loading="updateLoading">
          Save
        </UButton>
        <UButton v-if="canDelete" color="error" variant="solid" @click="open = !open">
          Delete Team
        </UButton>
      </div>
    </form>
    <div v-if="canDelete" class="mt-6">
      <UCollapsible v-model:open="open">
        <template #content>
          <UAlert
            title="Delete Team"
            description="Here you can delete your team. This action is irreversible."
            color="error"
            variant="soft"
            :actions="[
              {
                label: 'Delete',
                color: 'error',
                variant: 'soft',
                onClick: deleteCurrentTeam,
              },
            ]"
          />
        </template>
      </UCollapsible>
    </div>
  </div>
</template>

