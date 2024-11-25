export enum EnvType {
  DEVELOPMENT = 'development',
  PREVIEW = 'preview',
  PRODUCTION = 'production',
}

export type Environment = {
  id: number
  teamId: number
  name: string
  createdAt: Date
  updatedAt: Date
}

export type CreateEnvironmentInput = {
  teamId: number
  name: string
}

export type UpdateEnvironmentInput = {
  id: number
  name?: string
}
