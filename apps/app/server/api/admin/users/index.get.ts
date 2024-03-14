import { getAllUsers } from "~/server/app/userService";

export default eventHandler(async () => {
  return await getAllUsers();
});
