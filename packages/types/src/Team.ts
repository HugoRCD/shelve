import { Role } from './User'
import type { Project } from './Project'
import type { User } from './User'

export enum TeamRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

export type Member = {
  id: number;
  userId: number;
  teamId: number;
  role: TeamRole;
  user: User;
  createdAt: Date;
  updatedAt: Date;
};

export type Team = {
  id: number;
  name: string;
  private: boolean;
  createdAt: Date;
  updatedAt: Date;
  members: Member[];
};

type Requester = {
  id: number;
  role: Role;
  teamRole: TeamRole;
}

export type CreateTeamInput = {
  name: string;
  private: boolean;
  requester: Requester;
};

export type UpdateTeamInput = {
  id: number;
  name?: string;
  members?: Member[];
  projects?: Project[];
  requester: Requester;
}

export type DeleteTeamInput = {
  teamId: number
  requester: Requester
}
