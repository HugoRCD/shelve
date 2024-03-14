export enum Role {
  Admin = "admin",
  User = "user",
}

export type User = {
  id: number;
  username: string | null;
  email: string;
  password: string | null;
  otp: string | null;
  avatar: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
};

export type Session = {
  id: number;
  userId: number;
  authToken: string;
  expiresAt: Date;
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

export type UserCreateInput = {
  email: string;
  password?: string;
};

export type UserUpdateInput = {
  username?: string;
  password?: string;
  email?: string;
  role?: Role;
};
