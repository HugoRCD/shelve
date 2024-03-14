import prisma, { formatUser } from "~/server/database/client";

export default eventHandler(async () => {
  const users = await prisma.user.findMany({
    cacheStrategy: { ttl: 60 },
  });
  return users.map((user) => {
    return formatUser(user);
  });
});
