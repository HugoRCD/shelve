import { createEnvFile, getProjectVariable } from "../utils/env.ts";
import { defineCommand } from "citty";
import consola from "consola";

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
    console.log("Pulling env variables for", ctx.args.env);
    const variables = await getProjectVariable(1, ctx.args.env);
    await createEnvFile(variables);
    consola.success("Pulled successfully!");
  },
});
