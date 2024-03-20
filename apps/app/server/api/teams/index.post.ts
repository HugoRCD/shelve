import { createTeam } from "~/server/app/teamsService";
import { H3Event } from "h3";

export default eventHandler(async (event: H3Event) => {
  const user = event.context.user;
  const createTeamInput = await readBody(event);
  return await createTeam(createTeamInput, user.id);
});
