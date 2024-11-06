export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}

export type User = {
  id: number;
  username: string | null;
  email: string;
  avatar: string;
  role: Role | string;
  createdAt: Date;
  updatedAt: Date;
};

export type publicUser = {
  id: number;
  username: string;
  email: string;
  avatar: string;
  role: Role;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type UpdateUserInput = {
  username?: string;
  password?: string;
  email?: string;
  avatar?: string;
  role?: Role;
};
