import { Role } from './User'
import type { Project } from './Project'
import type { User } from './User'

export enum TeamRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  DEVELOPER = 'DEVELOPER',
}

export type Member = {
  id: number;
  userId: number;
  teamId: number;
  role: TeamRole;
  createdAt: Date;
  updatedAt: Date;
  team: Team;
  user: User;
};

export type Team = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  members: Member[];
  projects: Project[];
};

export type CreateTeamInput = {
  name: string;
};

export type UpdateTeamInput = {
  id: number;
  name: string;
  members: Member[];
  projects: Project[];
}

export type DeleteTeamInput = {
  teamId: number
  userId: number
  userRole: Role
}
