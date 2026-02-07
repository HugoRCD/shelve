export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}

export enum AuthType {
  GITHUB = 'github',
  GOOGLE = 'google',
  EMAIL = 'email',
}

export type User = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  emailVerified: boolean;
  role: 'admin' | 'user';
  authType: 'github' | 'google' | 'email';
  onboarding: boolean;
  cliInstalled: boolean;
  legacyId?: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateUserInput = {
  email: string;
  name: string;
  image?: string;
  authType: AuthType;
  appUrl: string;
};
