import prisma, { formatUser } from "~/server/database/client";
import { Role, type User, type UserCreateInput, type UserUpdateInput } from "~/types/User";
import { generateOtp } from "~/server/app/authService";
import { sendOtp } from "~/server/app/resendService";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

type jwtPayload = {
  id: number;
  role: Role;
  username: string;
  email: string;
};

const runtimeConfig = useRuntimeConfig().private;

export async function upsertUser(userCreateInput: UserCreateInput) {
  const { otp, encryptedOtp } = await generateOtp();
  let password = userCreateInput.password;
  if (password) password = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: {
      email: userCreateInput.email,
    },
    update: {
      otp: encryptedOtp,
      password,
    },
    create: {
      ...userCreateInput,
      password,
      otp: encryptedOtp,
    },
  });
  if (!userCreateInput.password) await sendOtp(user.email, otp);
  return formatUser(user);
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },
    cacheStrategy: { ttl: 60 },
  });
}

export async function deleteUser(userId: number) {
  return prisma.user.delete({
    where: {
      id: userId,
    },
  });
}

export async function getAllUsers() {
  const users = await prisma.user.findMany({
    cacheStrategy: { ttl: 60 },
  });
  return users.map((user) => {
    return formatUser(user);
  });
}

export const getUserByAuthToken = cachedFunction(async (authToken: string)=> {
  const user = await prisma.user.findFirst({
    where: {
      authToken,
    },
  });
  if (!user) return null;
  const decoded = jwt.verify(authToken, runtimeConfig.authSecret) as jwtPayload;
  if (decoded.id !== user.id) return null;
  return formatUser(user);
}, {
  maxAge: 20,
  name: "getUserByAuthToken",
  getKey: (authToken: string) => `authToken:${authToken}`,
})

export async function setAuthToken(user: User) {
  const authToken = jwt.sign(
    {
      id: user.id,
      role: user.role,
      username: user.username,
      email: user.email,
    },
    runtimeConfig.authSecret,
    { expiresIn: "30d" },
  );
  return prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      authToken,
    },
  });
}

export async function updateUser(user: User, updateUserInput: UserUpdateInput) {
  const newUsername = updateUserInput.username;
  if (newUsername && newUsername !== user.username) {
    const usernameTaken = await prisma.user.findFirst({
      where: {
        username: newUsername,
      },
    });
    if (usernameTaken) throw createError({ statusCode: 400, message: "Username already taken" });
  }
  if (updateUserInput.password) {
    updateUserInput.password = await bcrypt.hash(updateUserInput.password, 10);
  }
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...updateUserInput,
    },
  });
  await removeCachedUser(user.authToken as string);
  return formatUser(updatedUser);
}

async function removeCachedUser(authToken: string) {
  return await useStorage('cache').removeItem(`nitro:functions:getUserByAuthToken:authToken:${authToken}.json`);
}

export async function updateRoleUser(userId: number, role: Role) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      role,
    },
  });
  return formatUser(user);
}
