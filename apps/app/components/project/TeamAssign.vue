<script setup lang="ts">
import type { Team } from "@shelve/types";
import type { PropType } from "vue";

const { team, projectId } = defineProps({
  team: {
    type: Object as PropType<Team>,
    required: true,
  },
  projectId: {
    type: Number,
    required: true,
  },
});

const loading = ref(false);
const refresh = inject("refresh") as Function;

async function addTeamToProject(teamId: number) {
  loading.value = true;
  try {
    await $fetch(`/api/project/${projectId}/team/${teamId}`, {
      method: "POST",
    });
    toast.success("Team added to project");
    await refresh();
  } catch (error) {
    toast.error("An error occurred");
  }
  loading.value = false;
}
</script>

<template>
  <div :key="team.id" class="flex items-center justify-between rounded-lg bg-neutral-100 p-4 dark:bg-neutral-800">
    <div class="flex items-center gap-4">
      <h3 class="text-sm font-semibold">
        {{ team.name }}
      </h3>
      <TeamMembers :members="team.members" :team-id="team.id" display />
    </div>
    <div class="flex gap-4">
      <UButton
        color="primary"
        class="text-xs"
        :loading="loading"
        label="Link"
        icon="i-lucide-link"
        @click="addTeamToProject(team.id)"
      />
    </div>
  </div>
</template>
