import { getProjects, writeProjectConfig } from "../utils/projects.ts";
import { defineCommand } from 'citty'
import { consola } from 'consola'

export default defineCommand({
  meta: {
    name: 'link',
    description: 'Link current project to a remote project',
  },
  async setup() {
    consola.start("Fetching projects...");
    const projects = await getProjects();

    try {
      const selectedProject = await consola.prompt("Select a project to link", {
        type: "select",
        options: projects.map((project: any) => ({
          label: project.name,
          value: project.id
        })),
      });

      writeProjectConfig(selectedProject);
      consola.success("Project linked successfully");
    } catch (e) {
      consola.error("An error occurred while selecting the project");
    }
  },
})
