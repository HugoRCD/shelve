import { upsertProject } from "~/server/app/projectService";
import { H3Event } from "h3";

export default eventHandler(async (event: H3Event) => {
  const user = event.context.user;
  const projectCreateInput = await readBody(event);
  delete projectCreateInput.variables;
  delete projectCreateInput.owner;
  return await upsertProject({ ...projectCreateInput, ownerId: user.id });
});
