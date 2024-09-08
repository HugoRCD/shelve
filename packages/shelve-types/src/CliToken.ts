import { User } from './User'

export type CliToken = {
  id: number;
  name: string;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  user: User;
};
