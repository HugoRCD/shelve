export enum Role {
  Admin = "admin",
  User = "user",
}

export type User = {
  id: number;
  username: string;
  email: string;
  otp: string | null;
  avatar: string;
  role: Role;
  authToken: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type publicUser = {
  id: number;
  username: string;
  email: string;
  avatar: string;
  role: Role;
  authToken: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type UserCreateInput = {
  username: string;
  email: string;
  password: string;
};

export type UserUpdateInput = {
  username?: string;
  email?: string;
  code?: number;
  role?: Role;
};
