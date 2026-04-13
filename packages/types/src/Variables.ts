import type { Environment } from './Environment'

export type VariableGroup = {
  id: number;
  name: string;
  description: string;
  position: number;
  projectId: number;
  createdAt: Date;
  updatedAt: Date;
}

export type VariableValue = {
  value: string;
  environmentId: number;
  environment?: Environment;
}

export type Variable = {
  id: number;
  key: string;
  description?: string | null;
  groupId?: number | null;
  group?: VariableGroup | null;
  projectId: number;
  values: VariableValue[];
  createdAt: Date;
  updatedAt: Date;
}

export type CreateVariablesInput = {
  projectId: number;
  autoUppercase?: boolean;
  environmentIds: number[];
  variables: {
    index?: number;
    key: string;
    value: string;
    description?: string;
  }[];
  syncWithGitHub?: boolean;
};

export type EnvVar = {
  key: string;
  value: string;
}

export type EnvVarExport = {
  key: string;
  value: string;
  description?: string;
  group?: { name: string; description: string };
}

export type UpdateVariableInput = {
  id: number;
  key: string;
  description?: string | null;
  groupId?: number | null;
  values: {
    environmentId: number;
    value: string;
  }[];
  autoUppercase?: boolean;
}

export type CreateVariableGroupInput = {
  name: string;
  description?: string;
  position?: number;
  projectId: number;
}

export type UpdateVariableGroupInput = {
  id: number;
  name?: string;
  description?: string;
  position?: number;
}
