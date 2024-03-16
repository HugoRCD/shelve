import { defineCommand } from "citty";
import consola from "consola";
import { pushProjectVariable } from "../utils/env.ts";

export default defineCommand({
  meta: {
    name: "push",
    description: "Pushes to the environment",
  },
  args: {
    env: {
      type: "string",
      description: "Environment to push to",
      valueHint: "production|preview|development",
      default: "development",
    },
  },
  async run(ctx) {
    await pushProjectVariable(3, ctx.args.env)
    consola.success("Pushed successfully!");
  },
});
