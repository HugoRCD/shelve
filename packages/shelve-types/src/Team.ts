import { Project } from "./Project";
import { User } from "./User";

export enum TeamRole {
  OWNER = "owner",
  ADMIN = "admin",
  DEVELOPER = "developer",
}

export type Role = {
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
  roles: Role[];
  projects: Project[];
};

export type CreateTeamInput = {
  name: string;
};

export type UpdateTeamInput = {
  id: number;
  name: string;
  roles: Role[];
  projects: Project[];
}
