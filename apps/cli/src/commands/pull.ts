import { createEnvFile, getProjectVariable } from "../utils/env.ts";
import { defineCommand } from "citty";
import consola from "consola";
import { getProjectId } from "../utils/projects.ts";

export default defineCommand({
  meta: {
    name: "pull",
    description: "Pulls from the environment",
  },
  args: {
    env: {
      type: "string",
      description: "Environment to pull from",
      valueHint: "production|preview|development",
      default: "development",
    },
  },
  async run(ctx) {
    const projectId = getProjectId();
    if (!projectId) {
      consola.error("Project is not linked run `shelve link` to link the project");
      return;
    }
    const variables = await getProjectVariable(projectId, ctx.args.env);
    await createEnvFile(variables);
    consola.success("Pulled successfully!");
  },
});
