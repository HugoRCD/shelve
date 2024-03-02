import prisma from "~/server/database/client";
import { Role } from "~/types/User";

type createUserDto = {
  email: string;
  code: number;
  role: Role;
}

export async function createUser({ email, code, role }: createUserDto) {
  return prisma.user.create({
    data: {
      username: "test",
      email,
      otp: code.toString(),
      role,
    }
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    }
  });
}
