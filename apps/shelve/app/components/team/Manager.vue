<script setup lang="ts">
const currentTeam = useCurrentTeam()
const teamId = useTeamId()
const teams = useUserTeams()

const newTeamName = ref('')

const {
  createTeam,
  selectTeam,
} = useTeams()

const loading = ref(false)
async function handleCreateTeam() {
  loading.value = true
  await createTeam(newTeamName.value)
  newTeamName.value = ''
  loading.value = false
}

const groups = computed(() => [
  {
    id: 'teams',
    label: 'Teams',
    slot: 'teams',
    items: teams.value.map((team) => ({
      label: team.name,
      avatar: {
        alt: team.name,
        size: 'sm',
        src: team.logo,
      },
      disabled: team.id === teamId.value,
      onSelect: () => {
        selectTeam(team.id)
      }
    }))
  }
])
</script>

<template>
  <UModal>
    <UButton
      :label="currentTeam.name"
      color="neutral"
      size="sm"
      :avatar="{
        src: currentTeam.logo,
        size: 'xs',
        alt: currentTeam.name,
      }"
      class="w-full"
      block
      trailing-icon="lucide:grip"
    />
    <template #content>
      <UCommandPalette
        v-model:search-term="newTeamName"
        :groups
        placeholder="Search or create a team"
        :loading
        class="h-80"
      >
        <template #teams-trailing="{ item }">
          <span v-if="!item.disabled" class="text-xs text-neutral-500">
            Select team
          </span>
        </template>
        <template #empty>
          <form
            class="flex flex-col gap-1 p-4"
            @submit.prevent="handleCreateTeam"
          >
            <div class="flex flex-col gap-2 items-center mb-4">
              <UIcon name="lucide:users" class="size-8" />
              <h3 class="text-2xl font-light font-newsreader italic text-pretty max-w-sm">
                Looks like you don't have any team yet.
              </h3>
              <p class="text-sm text-neutral-500">
                Create a team to start collaborating with your team members.
              </p>
            </div>
            <UButton
              :label="`Create '${newTeamName}' team`"
              color="primary"
              type="submit"
              :loading
              block
            />
          </form>
        </template>
      </UCommandPalette>
    </template>
  </UModal>
</template>

