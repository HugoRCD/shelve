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
  <UModal title="Switch team" description="Select a team to switch to">
    <button class="nav-item w-full flex items-center justify-between">
      <span class="flex items-center gap-2">
        <UAvatar :src="currentTeam.logo" size="sm" alt="currentTeam.name" />
        <span class="text-sm">
          {{ currentTeam.name }}
        </span>
      </span>
      <span><UIcon name="lucide:grip" class="size-4" /></span>
    </button>
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
              <h3 class="text-2xl font-light font-newsreader italic text-pretty max-w-xs">
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

<style scoped>
@import "tailwindcss";

.nav-item {
  @apply cursor-pointer rounded-lg px-3 py-2 flex flex-row items-center gap-2 transition-transform duration-200 ease-in-out;
  border: 1px solid transparent;
  transition: border-color 0.2s, background-color 0.2s, box-shadow 0.2s, transform 0.2s;

  span {
    transform: translateY(-1.2px);
  }
}

.light {
  .nav-item {
    color: #575757;
    border: 1px solid #ececec;
    background-color: #ffffff;
    box-shadow: 0 1px 0 #cccccc, 0 -3px 0 #ececec inset;
  }

  .nav-item:active {
    box-shadow: 0 1px 0 #cccccc, 0 -0.5px 0 #ececec inset;

    span {
      transform: translateY(0.5px);
    }
  }
}

.dark {
  .nav-item {
    color: #b5b3b3;
    border: 1px solid #414141;
    background-color: #262626;
    box-shadow: 0 1px 0 #2f2f2f, 0 -3px 0 #414141 inset;
  }

  .nav-item:active {
    box-shadow: 0 1px 0 #2f2f2f, 0 -0.5px 0 #414141 inset;

    span {
      transform: translateY(0.5px);
    }
  }
}
</style>
