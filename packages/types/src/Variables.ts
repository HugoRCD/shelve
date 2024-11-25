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
  }[];
};

export type Env = {
  key: string;
  value: string;
}

export type UpdateVariableInput = {
  id: number;
  projectId: number;
  key: string;
  values: {
    environmentId: number;
    value: string;
  }[];
  autoUppercase?: boolean;
}
