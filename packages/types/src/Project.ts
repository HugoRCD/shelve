import type { Requester } from './Team'

export type Project = {
  id: number;
  name: string;
  description: string | null;
  repository: string | null;
  projectManager: string | null;
  homepage: string | null;
  variablePrefix: string | null;
  logo: string | null;
  teamId: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateProjectInput = {
  name: string;
  description?: string;
  logo?: string;
  repository?: string;
  projectManager?: string;
  homepage?: string;
  variablePrefix?: string;
  teamId: number;
  requester?: Requester;
};

export type ProjectUpdateInput = {
  id: number;
  name: string;
  description?: string;
  logo?: string;
  homepage?: string;
  repository?: string;
  projectManager?: string;
  variablePrefix?: string;
  teamId: number;
  requester: Requester;
};

