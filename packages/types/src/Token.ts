import type { User } from './User'

export type Token = {
  id: number;
  name: string;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user?: User;
};
