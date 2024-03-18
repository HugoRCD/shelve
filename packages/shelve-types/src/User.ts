export enum Role {
  ADMIN = "admin",
  USER = "user",
}

export enum ProjectRole {
  OWNER = "owner",
  ADMIN = "admin",
  DEVELOPER = "developer",
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
