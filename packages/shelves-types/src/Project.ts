import type { Variable } from "./Variables";

export type Project = {
  id: number;
  name: string;
  description?: string;
  avatar?: string;
  ownerId: number;
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
};
