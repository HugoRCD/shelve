import type { ShelveSyncConfig } from './Sync'

export type Project = {
  id: number;
  name: string;
  description: string;
  repository: string;
  projectManager: string;
  homepage: string;
  variablePrefix: string;
  logo: string;
  teamId: number;
  syncPolicy?: ShelveSyncConfig | null;
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
  syncPolicy?: ShelveSyncConfig | null;
};

