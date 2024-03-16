import type { Variable } from "@shelve/types";

export function copyEnv(variables: Variable[], env: "production" | "staging" | "development") {
  const envVariables = variables.filter((variable) => variable.environment.includes(env))
  const envString = envVariables.map((variable) => `${variable.key}=${variable.value}`).join("\n")
  copyToClipboard(envString, "Copied to clipboard")
}

export function downloadEnv(variables: Variable[], env: "production" | "staging" | "development") {
  const envVariables = variables.filter((variable) => variable.environment.includes(env))
  const envString = envVariables.map((variable) => `${variable.key}=${variable.value}`).join("\n")
  const blob = new Blob([envString], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `.env.${env}`
  a.click()
  URL.revokeObjectURL(url)
}
