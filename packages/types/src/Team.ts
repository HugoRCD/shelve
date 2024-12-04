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
  role: TeamRole;
}

export type RemoveMemberInput = {
  teamId: number;
  memberId: number;
}
