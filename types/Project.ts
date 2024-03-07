import type { Variable } from "~/types/Variables";

export type Project = {
  id: number;
  name: string;
  description: string;
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;
  variables?: Variable[];
};

export type ProjectCreateInput = {
  name: string;
  description: string;
  ownerId: number;
};

export type ProjectUpdateInput = {
  id: number;
  name?: string;
  description?: string;
};
