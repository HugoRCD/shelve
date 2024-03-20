import type { Team, UpdateTeamInput } from "@shelve/types";
import { TeamRole } from "@shelve/types";

export const useUserTeams = () => {
  return useState<Team[]>("teams");
};

export function useTeams() {
  const teams = useUserTeams();
  const loading = ref(false);
  const createLoading = ref(false);

  async function fetchTeams () {
    loading.value = true;
    const response = await $fetch<Team[]>("/api/teams", {
      method: "GET",
    });
    teams.value = response;
    loading.value = false;
  }

  async function createTeam(teamName: string) {
    createLoading.value = true;
    try {
      const response = await $fetch<Team>("/api/teams", {
        method: "POST",
        body: {
          name: teamName,
        },
      });
      teams.value.push(response);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create team");
    }
    createLoading.value = false;
  }

  async function updateTeam(updateTeamInput: UpdateTeamInput) {
    try {
      const response = await $fetch<Team>(`/api/teams/${updateTeamInput.id}`, {
        method: "PUT",
        body: updateTeamInput,
      });
      const index = teams.value.findIndex((team) => team.id === updateTeamInput.id);
      teams.value[index] = response;
      toast.success("Team updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update team");
    }
  }

  async function deleteTeam(teamId: number) {
    try {
      teams.value = teams.value.filter((team) => team.id !== teamId);
      await $fetch(`/api/teams/${teamId}`, {
        method: "DELETE",
      });
      toast.success("Team deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete team");
    }
  }

  return {
    teams,
    loading,
    createLoading,
    fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
  };
}
