export enum Role {
  ADMIN = "admin",
  USER = "user",
}

export type User = {
  id: number;
  username: string | null;
  email: string;
  password: string | null;
  otp: string | null;
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

export type CreateUserInput = {
  email: string;
  password?: string;
  avatar?: string;
  username?: string;
};

export type UpdateUserInput = {
  username?: string;
  password?: string;
  email?: string;
  avatar?: string;
  role?: Role;
};
