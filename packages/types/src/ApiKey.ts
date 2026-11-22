import type { User } from './User'

export type ApiKeyPermission = 'read' | 'write'

export type ApiKeyScopes = {
  teamIds?: number[]
  projectIds?: number[]
  environmentIds?: number[]
  permissions: ApiKeyPermission[]
}

/** An API key as listed in the app. Field names follow Better Auth's `apikey` model. */
export type ApiKey = {
  id: number;
  name: string;
  /** The key's first characters, shown in the UI. */
  start: string;
  scopes: ApiKeyScopes;
  allowedCidrs: string[];
  expiresAt: Date | null;
  lastRequest: Date | null;
  lastUsedIp: string | null;
  createdAt: Date;
  updatedAt: Date;
  /** The ID of the user who owns the key. */
  referenceId: number;
  user?: User;
};

/** A newly created API key, with the key itself, which is only returned once. */
export type ApiKeyWithSecret = ApiKey & {
  key: string;
};

export type CreateApiKeyInput = {
  name: string;
  scopes?: ApiKeyScopes;
  expiresIn?: number | null;
  allowedCidrs?: string[];
};
