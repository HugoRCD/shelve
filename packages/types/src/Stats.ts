export type Stat = {
  label: string
  value: number
}

export type Stats = {
  users: Stat
  variables: Stat
  teams: Stat
  projects: Stat
}

export type UseStatsOptions = {
  baseUrl?: string
}
