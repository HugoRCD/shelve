export enum Environment {
  PRODUCTION = "production",
  PREVIEW = "preview",
  DEVELOPMENT = "development",
}

export type Variable = {
  id: number;
  key: string;
  value: string;
  projectId: number;
  environment: Environment;
  createdAt: Date;
  updatedAt: Date;
};

export type VariableCreateInput = {
  id?: number;
  key: string;
  value: string;
  projectId: number;
  environment: Environment;
};
