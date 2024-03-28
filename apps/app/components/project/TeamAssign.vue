<script setup lang="ts">
import type { Team } from "@shelve/types";
import type { PropType } from "vue";

const { team, projectId, isEmit } = defineProps({
  team: {
    type: Object as PropType<Team>,
    required: true,
  },
  projectId: {
    type: Number,
    required: true,
  },
  isEmit: {
    type: Boolean,
    default: false,
  },
});

const loading = ref(false);

const refresh = inject("refresh", () => {}) as Function;

const emit = defineEmits(["addTeam"]);
async function addTeamToProject(teamId: number) {
  if (isEmit) {
    emit("addTeam", team);
  } else {
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
}
</script>

<template>
  <div :key="team.id" class="flex items-center justify-between">
    <div class="flex flex-col gap-2">
      <h3 class="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
        {{ team.name }}
      </h3>
      <TeamMembers :members="team.members" :team-id="team.id" />
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
