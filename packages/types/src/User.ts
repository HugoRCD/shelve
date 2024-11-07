export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export type User = {
  id: number;
  username: string;
  email: string;
  avatar: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
};

export type PublicUser = Omit<User, 'createdAt' | 'updatedAt'>;

export type CreateUserInput = {
  email: string;
  username: string;
  avatar?: string;
};

export type UpdateUserInput = {
  currentUser: User;
  data: {
    username?: string;
    password?: string;
    email?: string;
    avatar?: string;
    role?: Role;
  }
};
