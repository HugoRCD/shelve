import type { Requester, Team } from './Team'

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
  // variables?: Variable[];
};

export type CreateProjectInput = {
  name: string;
  description?: string;
  logo?: string;
  repository?: string;
  projectManager?: string;
  homepage?: string;
  teamId: number;
};

export type ProjectUpdateInput = {
  id: number;
  name: string;
  description?: string;
  logo?: string;
  teamId: number;
  requester: Requester;
};

