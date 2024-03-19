import type { Variable } from "./Variables";
import type { User } from "./User";

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
  createdAt: Date;
  updatedAt: Date;
  variables?: Variable[];
};

export type ProjectCreateInput = {
  id?: number;
  name: string;
  description?: string;
  avatar?: string;
  ownerId: number;
  usersId?: number[];
};

export type ProjectUpdateInput = {
  name?: string;
  description?: string;
  avatar?: string;
  ownerId?: number;
  usersId?: number[];
};

