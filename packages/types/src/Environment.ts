export enum EnvType {
  DEVELOPMENT = 'development',
  PREVIEW = 'preview',
  PRODUCTION = 'production',
}

export type Environment = {
  id: number
  name: string
  teamId: number
  createdAt: Date
  updatedAt: Date
}

export type CreateEnvironmentInput = {
  name: string
  teamId: number
}

export type UpdateEnvironmentInput = {
  id: number
  name?: string
}
