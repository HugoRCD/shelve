import type { CommandGroup, CommandItem } from '@types'

export function useAppCommands() {
  const teams = useTeams()
  const colorMode = useColorMode()
  const { version } = useRuntimeConfig().public
  const defaultTeamSlug = useCookie<string>('defaultTeamSlug')
  const _currentTeam = useTeam()
  const { selectTeam, createTeam } = useTeamsService()

  const currentTeam = computed(() =>
    _currentTeam.value ?? teams.value.find((team) => team.slug === defaultTeamSlug.value)
  )

  // Theme commands
  const themeCommands = ref<CommandItem[]>([
    {
      id: 'theme-light',
      label: 'Light Mode',
      icon: 'lucide:sun',
      description: 'Switch to light mode',
      action: () => {
        colorMode.preference = 'light'
      },
      keywords: ['light', 'theme', 'mode', 'day', 'bright'],
      active: computed(() => colorMode.preference === 'light').value
    },
    {
      id: 'theme-dark',
      label: 'Dark Mode',
      icon: 'lucide:moon',
      description: 'Switch to dark mode',
      action: () => {
        colorMode.preference = 'dark'
      },
      keywords: ['dark', 'theme', 'mode', 'night', 'black'],
      active: computed(() => colorMode.preference === 'dark').value
    }
  ])

  // Navigation commands
  const navigationCommands = ref<CommandItem[]>([
    {
      id: 'nav-home',
      label: 'Go to Dashboard',
      icon: 'lucide:layout-dashboard',
      description: 'Navigate to the dashboard',
      action: () => {
        navigateTo(`/${defaultTeamSlug.value}`)
      },
      keywords: ['home', 'dashboard', 'main'],
    },
    {
      id: 'nav-environments',
      label: 'Environments',
      icon: 'lucide:cloud',
      description: 'Navigate to the environments page',
      action: () => {
        navigateTo(`/${defaultTeamSlug.value}/environments`)
      },
      keywords: ['environments', 'projects', 'variables'],
    },
    {
      id: 'nav-settings',
      label: 'Settings',
      icon: 'lucide:settings',
      description: 'Open settings page',
      action: () => {
        navigateTo('/user/settings')
      },
      keywords: ['settings', 'preferences', 'config'],
    },
    {
      id: 'nav-profile',
      label: 'Profile',
      icon: 'lucide:user',
      description: 'View your profile',
      action: () => {
        navigateTo('/user/profile')
      },
      keywords: ['profile', 'account', 'user'],
    },
  ])

  // Team commands
  const teamCommands = computed<CommandItem[]>(() => {
    return teams.value.map(team => ({
      id: `team-${team.id}`,
      label: team.name,
      icon: team.logo || 'lucide:users',
      isAvatar: Boolean(team.logo),
      description: `Switch to ${team.name} team`,
      action: () => selectTeam(team),
      keywords: ['team', 'switch', team.name],
      active: team.id === currentTeam.value?.id,
    }))
  })

  // Group all commands
  const commandGroups = computed<CommandGroup[]>(() => [
    {
      id: 'teams',
      label: 'Teams',
      items: teamCommands.value
    },
    {
      id: 'navigation',
      label: 'Navigation',
      items: navigationCommands.value
    },
    {
      id: 'theme',
      label: 'Theme',
      items: themeCommands.value
    }
  ])

  // Helper function to create a team
  const createTeamFromSearch = async (teamName: string) => {
    if (!teamName) return
    await createTeam(teamName)
  }

  return {
    commandGroups,
    createTeamFromSearch,
    version
  }
}
