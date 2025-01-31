import type { User } from './User'

export type Token = {
  id: number;
  name: string;
  token: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  user?: User;
};
