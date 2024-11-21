import type { User } from './User'
import { Role } from './User'

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
  logo: string;
  private: boolean;
  privateOf: number | null;
  createdAt: Date;
  updatedAt: Date;
  members: Member[];
};

export type Requester = {
  id: number;
  role: Role;
}

export type CreateTeamInput = {
  name: string;
  private?: boolean;
  logo?: string;
  requester: Requester;
};

export type UpdateTeamInput = {
  teamId: number;
  name?: string;
  logo?: string;
  requester: Requester;
}

export type DeleteTeamInput = {
  teamId: number
  requester: Requester
}

export type AddMemberInput = {
  teamId: number;
  email: string;
  role: TeamRole;
  requester: Requester;
}

export type UpdateMemberInput = {
  teamId: number;
  memberId: number;
  role: TeamRole;
  requester: Requester;
}

export type RemoveMemberInput = {
  teamId: number;
  memberId: number;
  requester: Requester;
}

export type ValidateAccess = {
  teamId: number;
  requester: Requester;
}
