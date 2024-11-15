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
  createdAt: Date;
  updatedAt: Date;
};

export type CreateUserInput = {
  email: string;
  username: string;
  avatar?: string;
  authType: AuthType;
};

export type UpdateUserInput = {
  id: number;
  username?: string;
  avatar?: string;
  authType: AuthType;
};
