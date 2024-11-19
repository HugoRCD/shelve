<script setup lang="ts">
import { TeamRole } from '@shelve/types'
import { ConfirmModal } from '#components'

definePageMeta({
  middleware: 'protected',
})

const { updateTeam, deleteTeam } = useTeams()

const updateLoading = ref(false)

const team = useCurrentTeam()

function updateCurrentTeam() {
  updateLoading.value = true
  toast.promise(updateTeam(team.value), {
    loading: 'Updating team...',
    success: 'Team updated successfully',
    error: 'Error updating team',
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
      <div style="--stagger: 1" data-animate class="flex items-center gap-4">
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
      <div style="--stagger: 2" data-animate class="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
        <div class="sm:col-span-3">
          <FormGroup v-model="team.name" label="Name" />
        </div>
        <div class="sm:col-span-4">
          <FormGroup v-model="team.logo" label="Logo" />
        </div>
      </div>
      <div style="--stagger: 4" data-animate class="mt-6 flex items-center justify-between gap-2">
        <UButton type="submit" :loading="updateLoading">
          Save
        </UButton>
        <UButton color="error" variant="solid" @click="open = !open">
          Delete Team
        </UButton>
      </div>
    </form>
    <div class="mt-6">
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

<style scoped>

</style>
