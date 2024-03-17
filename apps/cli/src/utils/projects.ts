import type { Project } from "@shelve/types";
import { $api } from "./connection.ts";
import fs from "fs";
import consola from "consola";

export async function getProjects(): Promise<Project[]> {
  return await $api('/project', {
    method: 'GET',
  });
}

export function writeProjectConfig(projectId: any) {
  if (!fs.existsSync('.shelve'))
    fs.mkdirSync('.shelve');
  fs.writeFileSync('.shelve/project.json', JSON.stringify({ projectId }));
  addDotShelveToGitignore();
}

export function loadProjectConfig(): { projectId?: string } {
  try {
    return JSON.parse(fs.readFileSync('.shelve/project.json', 'utf-8'));
  } catch {
    return {};
  }
}

export function getProjectId(): number | undefined {
  const projectId = loadProjectConfig().projectId;
  if (projectId) return parseInt(projectId);
}

export function hasProjectId(): boolean {
  return !!getProjectId();
}

export function deleteProjectConfig() {
  if (!fs.existsSync('.shelve/project.json')) {
    consola.error('Project is not linked');
    return;
  }
  fs.unlinkSync('.shelve/project.json');
  if (fs.readdirSync('.shelve').length === 0)
    fs.rmdirSync('.shelve');
}

export function addDotShelveToGitignore() {
  if (!fs.existsSync('.gitignore'))
    fs.writeFileSync('.gitignore', '.shelve');
  else {
    const gitignore = fs.readFileSync('.gitignore', 'utf-8');
    if (!gitignore.includes('.shelve'))
      fs.writeFileSync('.gitignore', `${gitignore}\n# Shelve config\n.shelve`);
  }
}
