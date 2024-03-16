import { defineCommand } from "citty";
import consola from "consola";

export default defineCommand({
  meta: {
    name: "push",
    description: "Pushes to the environment",
  },
  args: {
    env: {
      type: "string",
      description: "Environment to push to",
      valueHint: "production|preview|dev",
      default: "dev",
    },
  },
  async run(ctx) {
    console.log("Pushing env variables to", ctx.args);
    await consola.prompt("Do you want to continue?", {
      type: "confirm",
    });
    await new Promise((resolve) => {
      setTimeout(resolve, 2000);
      consola.start("Pushing...");
    });
    consola.success("Pushed successfully!");
  },
});
