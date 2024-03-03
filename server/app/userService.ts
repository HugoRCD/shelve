import prisma, { formatUser } from "~/server/database/client";
import { Role, UserCreateInput, type UserUpdateInput } from "~/types/User";
import { generateOtp } from "~/server/app/authService";
import { sendOtp } from "~/server/app/resendService";
import jwt from "jsonwebtoken";

export async function createUser(userData: UserCreateInput) {
  const foundUser = await prisma.user.findFirst({
    where: {
      email: userData.email,
    },
  });
  if (foundUser) {
    throw createError({
      statusCode: 400,
      statusMessage: "User already exists",
    });
  }
  const { otp, encryptedOtp } = await generateOtp();
  const user = await prisma.user.create({
    data: {
      ...userData,
      otp: encryptedOtp,
    },
  });
  await sendOtp(user.email, otp);
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

export async function getUserById(userId: number) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) throw createError({ statusCode: 404, message: "User not found" });
  return formatUser(user);
}

export async function getUserByLogin(login: string) {
  return prisma.user.findFirst({
    where: {
      OR: [{ email: login }, { username: login }],
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

export async function getUserByAuthToken(authToken: string) {
  const user = await prisma.user.findFirst({
    where: {
      authToken,
    },
  });
  if (!user) return null;
  return formatUser(user);
}

export async function setAuthToken(userId: number) {
  const user = await getUserById(userId);
  const authToken = jwt.sign(
    {
      id: user.id,
      role: user.role,
      username: user.username,
      email: user.email,
    },
    useRuntimeConfig().private.authSecret,
    { expiresIn: "30d" },
  );
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      authToken,
    },
  });
}

export async function updateUser(userId: number, updateUserInput: UserUpdateInput) {
  const foundUser = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });
  if (!foundUser) throw createError({ statusCode: 404, message: "User not found" });
  const newUsername = updateUserInput.username;
  if (newUsername && newUsername !== foundUser.username) {
    const usernameTaken = await prisma.user.findFirst({
      where: {
        username: newUsername,
      },
    });
    if (usernameTaken) throw createError({ statusCode: 400, message: "Username already taken" });
  }
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...updateUserInput,
    },
  });
  return formatUser(user);
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
