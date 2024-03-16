import type { EnvFile } from "../types/env.ts";
import { $api } from "./connection.ts";
import consola from "consola";
import fs from 'fs';

export function isEnvFileExist() {
  return fs.existsSync('.env');
}

export async function createEnvFile(variables: EnvFile = [], warn = true) {
  if (warn) consola.warn('.env file does not exist');
  const create = await consola.prompt('Do you want to create .env file? (y/n)', {
    type: 'confirm',
  });
  if (create) {
    const data = variables.map((item) => `${item.key}=${item.value}`).join('\n');
    fs.writeFileSync('.env', data, 'utf8');
    consola.success('.env file created');
    return true;
  } else {
    return false;
  }
}

export async function getEnvFile(): Promise<EnvFile> {
  const isExist = fs.existsSync('.env');
  if (isExist) {
    const envFile = fs.readFileSync('.env', 'utf8');
    const json = envFile.split('\n').map((item) => {
      const [key, value] = item.split('=');
      return {key, value};
    });
    return json;
  } else {
    const created = await createEnvFile();
    if (created) {
      return [];
    }
    return [];
  }
}

export async function getProjectVariable(projectId: number, environment: string): Promise<EnvFile> {
  consola.start("Pulling...");
  return await $api<EnvFile>(`/variable/${ projectId }/${ environment }`);
}
