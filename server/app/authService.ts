import { getUserByEmail, setAuthToken } from "~/server/app/userService";
import prisma from "~/server/database/client";
import bcrypt from "bcryptjs";

export async function verify(email: string, otp: string) {
  const user = await getUserByEmail(email);
  if (!user) throw createError({ statusCode: 404, statusMessage: "user_not_found" });
  if (!user.otp) throw createError({ statusCode: 400, statusMessage: "otp_not_set" });
  const isOtpCorrect = await bcrypt.compare(otp, user.otp);
  if (!isOtpCorrect) throw createError({ statusCode: 401, statusMessage: "invalid_password" });
  await deleteOtp(user.id);
  return await setAuthToken(user.id);
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
