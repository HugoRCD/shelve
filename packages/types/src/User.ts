export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}

export enum AuthType {
  GITHUB = 'github',
  GOOGLE = 'google',
}

export type User = {
  id: number;
  username: string;
  email: string;
  avatar: string;
  role: Role;
  authType: AuthType;
  onboarding: boolean;
  cliInstalled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateUserInput = {
  email: string;
  username: string;
  avatar?: string;
  authType: AuthType;
  appUrl: string;
};
