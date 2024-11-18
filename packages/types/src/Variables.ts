export type Environment = 'production' | 'preview' | 'development' | 'staging' | 'dev' | 'prod';

export type Variable = {
  id: number;
  key: string;
  value: string;
  projectId: number;
  environment: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateVariableInput = {
  key: string;
  value: string;
  projectId: number;
  environment: string;
  autoUppercase?: boolean;
};

export type CreateVariablesInput = {
  projectId: number;
  autoUppercase?: boolean;
  environment?: Environment;
  method?: 'overwrite' | 'merge';
  variables: {
    index?: number;
    key: string;
    value: string;
  }[];
};

export type UpdateVariableInput = {
  id: number;
  projectId: number;
  key?: string;
  value?: string;
  environment?: string;
  autoUppercase?: boolean;
}

export type Env = {
  key: string;
  value: string;
}
