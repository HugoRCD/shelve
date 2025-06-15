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

const overlay = useOverlay()
const modal = overlay.create(ConfirmModal)

function deleteCurrentTeam() {
  modal.open({
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

useSeoMeta({
  title: 'Settings',
})
</script>

<template>
  <PageSection
    v-if="team"
    title="Team Settings"
    description="Manage team settings"
    :image="team.logo"
  >
    <form class="flex flex-col" @submit.prevent="updateCurrentTeam">
      <div class="flex flex-col gap-4">
        <div class="max-w-sm space-y-4">
          <UFormField label="Name">
            <UInput v-model="team.name" :disabled="!canUpdate" class="w-full" />
          </UFormField>
          <UFormField label="Slug" help="This is the unique identifier for your team (used by the CLI)" :ui="{ help: 'text-xs' }">
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
        </div>
        <UFormField label="Logo">
          <UInput v-model="team.logo" :disabled="!canUpdate" class="w-full" />
        </UFormField>
      </div>
      <div class="mt-6 flex items-center justify-between gap-2">
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
  </PageSection>
</template>

