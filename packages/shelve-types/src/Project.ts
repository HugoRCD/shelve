import type { Variable } from "./Variables";
import type { User } from "./User";
import type { Team } from "./Team";

export type Project = {
  id: number;
  name: string;
  description?: string;
  repository?: string;
  projectManager?: string;
  homepage?: string;
  variablePrefix?: string;
  avatar?: string;
  ownerId: number;
  users: User[];
  team: Team;
  teamId: number;
  createdAt: Date;
  updatedAt: Date;
  variables?: Variable[];
};

export type CreateProjectInput = {
  name: string;
  description: string;
  avatar: string;
  repository: string;
  projectManager: string;
  homepage: string;
  team?: Team;
};

export type ProjectUpdateInput = {
  name: string;
  description: string;
  avatar: string;
  ownerId: number;
};

