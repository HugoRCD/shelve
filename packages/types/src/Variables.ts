import { Environment } from './Environment'

export type Variable = {
  id: number;
  key: string;
  value: string;
  projectId: number
  environments: Environment[];
  createdAt: Date;
  updatedAt: Date;
};

export type UpsertVariablesInput = {
  projectId: number;
  autoUppercase?: boolean;
  environmentIds: number[];
  method?: 'overwrite' | 'merge';
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
