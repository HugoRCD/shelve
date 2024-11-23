import type { User } from './User'

export type Token = {
  id: number;
  name: string;
  userId: number;
  token: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
};
