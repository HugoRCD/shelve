import type { Environment } from './Environment'

export type VariableValue = {
  value: string;
  environmentId: number;
  environment?: Environment;
}

export type Variable = {
  id: number;
  key: string;
  projectId: number;
  values: VariableValue[];
  createdAt: string;
  updatedAt: string;
}


export type CreateVariablesInput = {
  projectId: number;
  autoUppercase?: boolean;
  environmentIds: number[];
  variables: {
    index?: number;
    key: string;
    value: string;
  }[];
};

export type EnvVar = {
  key: string;
  value: string;
}

export type UpdateVariableInput = {
  id: number;
  key: string;
  values: {
    environmentId: number;
    value: string;
  }[];
  autoUppercase?: boolean;
}
