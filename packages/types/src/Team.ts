import type { User } from './User'
import type { Environment } from './Environment'

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
  user?: User;
  createdAt: Date;
  updatedAt: Date;
};

export type Team = {
  id: number;
  name: string;
  slug: string;
  logo: string;
  createdAt: Date;
  updatedAt: Date;
  members: Member[];
  environments?: Environment[];
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
  slug?: string;
  logo?: string;
}

export type DeleteTeamInput = {
  teamId: number
}

export type AddMemberInput = {
  teamId: number;
  email: string;
  role: TeamRole;
}

export type UpdateMemberInput = {
  teamId: number;
  memberId: number;
}

export type RemoveMemberInput = {
  teamId: number;
  memberId: number;
}
