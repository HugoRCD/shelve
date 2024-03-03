import { getUserByEmail, getUserByLogin, setAuthToken } from "~/server/app/userService";
import bcrypt from "bcryptjs";

export async function login(email: string, otp: string) {
  const user = await getUserByEmail(email);
  if (!user) throw createError({ statusCode: 404, statusMessage: "user_not_found" });
  if (!user.otp) throw createError({ statusCode: 400, statusMessage: "otp_not_set" });
  const isOtpCorrect = await bcrypt.compare(otp, user.otp);
  if (!isOtpCorrect) throw createError({ statusCode: 401, statusMessage: "invalid_password" });
  return await setAuthToken(user.id);
}

export async function generateOtp() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const encryptedOtp = await bcrypt.hash(otp, 10);
  return { otp, encryptedOtp };
}
