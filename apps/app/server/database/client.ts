import { withAccelerate } from '@prisma/extension-accelerate'
import { type User as prismaUser, PrismaClient } from "@prisma/client";
import { Role, type publicUser } from "shelves-types"

const prisma = new PrismaClient().$extends(withAccelerate())

export default prisma;

export function formatUser(user: prismaUser): publicUser {
  return {
    id: user.id,
    username: user.username || "",
    email: user.email,
    role: user.role as Role,
    avatar: user.avatar,
    authToken: user.authToken || "",
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
