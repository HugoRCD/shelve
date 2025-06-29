export type Project = {
  id: number;
  name: string;
  description: string;
  repository: string;
  projectManager: string;
  homepage: string;
  variablePrefix: string;
  vercelProjectId?: string | null;
  logo: string;
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
  vercelProjectId?: string | null;
  teamId: number;
};

export type ProjectUpdateInput = {
  id: number;
  name?: string;
  description?: string;
  logo?: string;
  homepage?: string;
  repository?: string;
  projectManager?: string;
  variablePrefix?: string;
  vercelProjectId?: string | null;
  teamId: number;
};

