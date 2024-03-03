import { getUserByLogin, setAuthToken } from "~/server/app/userService";
import bcrypt from "bcryptjs";

export async function login(login: string, password: string) {
  const user = await getUserByLogin(login);
  if (!user) throw createError({ statusCode: 404, statusMessage: "user_not_found" });
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw createError({ statusCode: 401, statusMessage: "invalid_password" });
  }
  return await setAuthToken(user.id);
}
