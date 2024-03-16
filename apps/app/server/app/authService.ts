import { getUserByEmail, setAuthToken } from "~/server/app/userService";
import type { DeviceInfo, User } from "@shelve/types";
import prisma from "~/server/database/client";
import bcrypt from "bcryptjs";

type VerifyDto = {
  email: string;
  password?: string;
  otp: string;
  deviceInfo: DeviceInfo;
};

export async function login(verifyDto: VerifyDto) {
  const user = await getUserByEmail(verifyDto.email);
  if (!user) throw createError({ statusCode: 404, statusMessage: "user_not_found" });
  if (verifyDto.password && user.password) {
    const isPasswordCorrect = bcrypt.compare(verifyDto.password, user.password);
    if (!isPasswordCorrect) throw createError({ statusCode: 401, statusMessage: "invalid_password" });
    return await setAuthToken(user as User, verifyDto.deviceInfo);
  }
  if (!user.otp) throw createError({ statusCode: 400, statusMessage: "otp_not_set" });
  const isOtpCorrect = await bcrypt.compare(verifyDto.otp, user.otp);
  if (!isOtpCorrect) throw createError({ statusCode: 401, statusMessage: "invalid_otp" });
  await deleteOtp(user.id);
  return await setAuthToken(user as User, verifyDto.deviceInfo);
}

export async function generateOtp() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const encryptedOtp = await bcrypt.hash(otp, 10);
  return { otp, encryptedOtp };
}

export async function deleteOtp(userId: number) {
  return await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      otp: null
    },
  });
}
