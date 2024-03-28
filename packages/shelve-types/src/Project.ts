import type { Variable } from "./Variables";
import type { User } from "./User";
import { Team } from "./Team";

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
  id?: number;
  name: string;
  description: string;
  avatar: string;
  ownerId: number;
  team?: Team;
};

export type ProjectUpdateInput = {
  name?: string;
  description?: string;
  avatar?: string;
  ownerId?: number;
};

