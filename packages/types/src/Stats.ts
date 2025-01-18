export type Stat = {
  label: string
  value: number
}

export type Stats = {
  users: Stat
  variables: Stat
  teams: Stat
  projects: Stat
  push: Stat
  pull: Stat
  activeVisitors: Stat
  savedTime: {
    seconds: number
    minutes: number
    hours: number
  }
}

export type UseStatsOptions = {
  baseUrl?: string
}
