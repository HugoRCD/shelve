export enum Role {
  Admin = "admin",
  User = "user",
}

export type User = {
  id: number;
  username: string;
  email: string;
  password: string;
  avatar: string;
  role: Role;
  authToken: string | null;
  createdAt: Date;
  updatedAt: Date;
};
