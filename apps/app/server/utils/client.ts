import { type User as prismaUser, PrismaClient } from '@prisma/client'
import { Role, type publicUser } from '@shelve/types'

export const prisma = new PrismaClient()

export function formatUser(user: prismaUser): publicUser {
  return {
    id: user.id,
    username: user.username || '',
    email: user.email,
    role: user.role as Role,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}
