import type { User } from './User'

export type TokenPermission = 'read' | 'write'

export type TokenScopes = {
  teamIds?: number[]
  projectIds?: number[]
  environmentIds?: number[]
  permissions: TokenPermission[]
}

export type Token = {
  id: number;
  name: string;
  prefix: string;
  scopes: TokenScopes;
  allowedCidrs: string[];
  expiresAt: Date | null;
  lastUsedAt: Date | null;
  lastUsedIp: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  user?: User;
};

export type TokenWithSecret = Token & {
  token: string;
};

export type CreateTokenInput = {
  name: string;
  scopes?: TokenScopes;
  expiresIn?: number | null;
  allowedCidrs?: string[];
};
