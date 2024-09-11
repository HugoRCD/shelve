export enum Environment {
  PRODUCTION = 'production',
  PREVIEW = 'preview',
  DEVELOPMENT = 'development',
}

export type Variable = {
  id: number;
  key: string;
  value: string;
  projectId: number;
  environment: string;
  createdAt: Date;
  updatedAt: Date;
};

export type VariableCreateInput = {
  index?: number;
  id?: number;
  key: string;
  value: string;
  projectId: number;
  environment: string;
};

export type VariablesCreateInput = {
  method?: 'overwrite' | 'merge';
  environment?: Environment;
  projectId: number;
  variables: VariableCreateInput[];
};

export type Env = {
  key: string;
  value: string;
}

export type EnvFile = Env[];
