import type { Member, Team, UpdateTeamInput } from "@shelve/types";
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
    teams.value = await $fetch<Team[]>("/api/teams", {
      method: "GET",
    });
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

  async function upsertMember(teamId: number, email: string, role: TeamRole) {
    try {
      const response = await $fetch<Member>(`/api/teams/${teamId}/members`, {
        method: "POST",
        body: {
          email,
          role,
        },
      });
      const index = teams.value.findIndex((team) => team.id === teamId);
      const team = teams.value[index];
      const memberIndex = team.members.findIndex((member) => member.id === response.id);
      if (memberIndex !== -1) {
        team.members[memberIndex] = response;
      } else {
        team.members.push(response);
      }
      console.log("team", team);
      teams.value.splice(index, 1, team);
      toast.success("Member added");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add member");
    }
  }

  async function removeMember(teamId: number, memberId: number) {
    try {
      await $fetch<Member>(`/api/teams/${teamId}/members/${memberId}`, {
        method: "DELETE",
      });
      const index = teams.value.findIndex((team) => team.id === teamId);
      const team = teams.value[index];
      team.members = team.members.filter((member) => member.id !== memberId);
      toast.success("Member removed");
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove member");
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
    deleteTeam,
    upsertMember,
    removeMember,
  };
}
