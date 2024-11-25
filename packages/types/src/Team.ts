import type { User } from './User'
import { Environment } from './Environment'

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
  environments: Environment[];
};

export type CreateTeamInput = {
  name: string;
  private?: boolean;
  logo?: string;
  requester: User;
};

export type UpdateTeamInput = {
  teamId: number;
  name?: string;
  logo?: string;
  requester: User;
}

export type DeleteTeamInput = {
  teamId: number
  requester: User
}

export type AddMemberInput = {
  teamId: number;
  email: string;
  role: TeamRole;
  requester: User;
}

export type UpdateMemberInput = {
  teamId: number;
  memberId: number;
  role: TeamRole;
  requester: User;
}

export type RemoveMemberInput = {
  teamId: number;
  memberId: number;
  requester: User;
}

export type ValidateAccess = {
  teamId: number;
  requester: User;
}
