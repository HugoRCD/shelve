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
  role: 'admin' | 'user';
  authType: 'github' | 'google';
  onboarding: boolean;
  cliInstalled: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateUserInput = {
  email: string;
  username: string;
  avatar?: string;
  authType: AuthType;
  appUrl: string;
};
