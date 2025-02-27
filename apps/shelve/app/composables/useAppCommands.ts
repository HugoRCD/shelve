import type { CommandGroup, CommandItem, SubMenuState } from '@types'

export function useAppCommands() {
  const teams = useTeams()
  const colorMode = useColorMode()
  const { version } = useRuntimeConfig().public
  const defaultTeamSlug = useCookie<string>('defaultTeamSlug')
  const _currentTeam = useTeam()
  const { selectTeam, createTeam } = useTeamsService()
  const route = useRoute()

  // Submenu state
  const subMenuState = reactive<SubMenuState>({
    active: false,
    parentId: '',
    title: '',
    items: []
  })

  const activateSubMenu = (parentId: string, title: string, items: CommandItem[]) => {
    subMenuState.active = true
    subMenuState.parentId = parentId
    subMenuState.title = title
    subMenuState.items = items
  }

  const deactivateSubMenu = () => {
    subMenuState.active = false
    subMenuState.parentId = ''
    subMenuState.title = ''
    subMenuState.items = []
  }

  const currentTeam = computed(() =>
    _currentTeam.value ?? teams.value.find((team) => team.slug === defaultTeamSlug.value)
  )

  // Theme commands - fully reactive
  const themeCommands = computed<CommandItem[]>(() => [
    {
      id: 'theme-light',
      label: 'Light Mode',
      icon: 'lucide:sun',
      description: 'Switch to light mode',
      action: () => {
        colorMode.preference = 'light'
      },
      keywords: ['light', 'theme', 'mode', 'day', 'bright'],
      active: colorMode.preference === 'light'
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
      active: colorMode.preference === 'dark'
    }
  ])

  // Settings submenu items
  const settingsSubMenuItems = computed<CommandItem[]>(() => [
    {
      id: 'settings-user',
      label: 'User Settings',
      icon: 'lucide:user-cog',
      description: 'Manage your user account settings',
      action: () => {
        navigateTo('/user/settings')
      },
      keywords: ['user', 'account', 'settings', 'preferences'],
      active: route.path === '/user/settings'
    },
    {
      id: 'settings-team',
      label: 'Team Settings',
      icon: 'lucide:users',
      description: 'Manage team settings',
      action: () => {
        navigateTo(`/${currentTeam.value?.slug}/settings`)
      },
      keywords: ['team', 'organization', 'settings', 'preferences'],
      active: route.path.includes('/settings') && !route.path.includes('/user/settings')
    },
    {
      id: 'settings-api',
      label: 'Tokens',
      icon: 'lucide:key',
      description: 'Manage API tokens',
      action: () => {
        navigateTo(`/user/tokens`)
      },
      keywords: ['api', 'keys', 'tokens', 'access'],
      active: route.path.includes('/user/tokens')
    }
  ])

  // Environment submenu items
  const environmentSubMenuItems = computed<CommandItem[]>(() => [
    {
      id: 'env-list',
      label: 'All Environments',
      icon: 'lucide:layers',
      description: 'View all environments',
      action: () => {
        navigateTo(`/${currentTeam.value?.slug}/environments`)
      },
      keywords: ['environments', 'all', 'list'],
      active: route.path === `/${currentTeam.value?.slug}/environments`
    },
    {
      id: 'env-create',
      label: 'Create Environment',
      icon: 'lucide:plus-circle',
      description: 'Create a new environment',
      action: () => {
        navigateTo(`/${currentTeam.value?.slug}/environments/new`)
      },
      keywords: ['environment', 'create', 'new', 'add'],
      active: route.path === `/${currentTeam.value?.slug}/environments/new`
    },
    {
      id: 'env-production',
      label: 'Production Environment',
      icon: 'lucide:globe',
      description: 'View production environment',
      action: () => {
        navigateTo(`/${currentTeam.value?.slug}/environments/production`)
      },
      keywords: ['environment', 'production', 'live'],
      active: route.path.includes('/environments/production')
    },
    {
      id: 'env-staging',
      label: 'Staging Environment',
      icon: 'lucide:flask-conical',
      description: 'View staging environment',
      action: () => {
        navigateTo(`/${currentTeam.value?.slug}/environments/staging`)
      },
      keywords: ['environment', 'staging', 'test'],
      active: route.path.includes('/environments/staging')
    }
  ])

  // Navigation commands with submenus
  const navigationCommands = computed<CommandItem[]>(() => [
    {
      id: 'nav-home',
      label: 'Dashboard',
      icon: 'lucide:layout-dashboard',
      description: 'Go to your dashboard',
      action: () => {
        navigateTo(`/${currentTeam.value?.slug}`)
      },
      keywords: ['home', 'dashboard', 'main'],
      active: route.path === `/${currentTeam.value?.slug}`
    },
    {
      id: 'nav-environments',
      label: 'Environments',
      icon: 'lucide:cloud',
      description: 'Manage environments',
      action: () => {
        activateSubMenu('nav-environments', 'Environments', environmentSubMenuItems.value)
      },
      keywords: ['environments', 'projects', 'variables'],
      active: route.path.includes('/environments'),
      hasSubmenu: true
    },
    {
      id: 'nav-settings',
      label: 'Settings',
      icon: 'lucide:settings',
      description: 'Manage settings',
      action: () => {
        activateSubMenu('nav-settings', 'Settings', settingsSubMenuItems.value)
      },
      keywords: ['settings', 'preferences', 'config'],
      active: route.path.includes('/settings'),
      hasSubmenu: true
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
      active: route.path === '/user/profile'
    },
  ])

  // Team commands - reactive
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

  // Help & Support commands
  const helpCommands = computed<CommandItem[]>(() => [
    {
      id: 'help-docs',
      label: 'Documentation',
      icon: 'lucide:book-open',
      description: 'Read the documentation',
      action: () => {
        window.open('https://shelve.cloud/docs/getting-started', '_blank')
      },
      keywords: ['docs', 'help', 'documentation', 'guide'],
    },
    {
      id: 'help-issues',
      label: 'Report Issue',
      icon: 'lucide:bug',
      description: 'Report a bug or issue',
      action: () => {
        window.open('https://github.com/HugoRCD/shelve/issues/new/choose', '_blank')
      },
      keywords: ['issues', 'bug', 'report', 'problem'],
    },
    {
      id: 'help-feedback',
      label: 'Send Feedback',
      icon: 'lucide:message-square',
      description: 'Send feedback or suggestions',
      action: () => {
        window.open('mailto:contact@shelve.cloud', '_blank')
      },
      keywords: ['feedback', 'suggestion', 'contact'],
    }
  ])

  // Utility commands
  const utilityCommands = computed<CommandItem[]>(() => [
    {
      id: 'util-clipboard',
      label: 'Copy Team ID',
      icon: 'lucide:clipboard-copy',
      description: 'Copy current team ID to clipboard',
      action: () => {
        if (currentTeam.value?.id) {
          copyToClipboard(currentTeam.value.id.toString())
        }
      },
      keywords: ['copy', 'clipboard', 'team', 'id'],
    },
    {
      id: 'util-version',
      label: `Version: ${version}`,
      icon: 'lucide:info',
      description: 'Current application version',
      keywords: ['version', 'app', 'info'],
    },
    {
      id: 'util-logout',
      label: 'Log Out',
      icon: 'lucide:log-out',
      description: 'Sign out of your account',
      action: async () => {
        await useLogout()
      },
      keywords: ['logout', 'signout', 'exit'],
    }
  ])

  // Group all commands
  const commandGroups = computed<CommandGroup[]>(() => {
    // If submenu is active, only show that
    if (subMenuState.active) {
      return [
        {
          id: `submenu-${subMenuState.parentId}`,
          label: subMenuState.title,
          items: subMenuState.items,
          backAction: deactivateSubMenu
        }
      ]
    }

    // Otherwise show all command groups
    return [
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
      },
      {
        id: 'help',
        label: 'Help & Support',
        items: helpCommands.value
      },
      {
        id: 'utility',
        label: 'Utilities',
        items: utilityCommands.value
      }
    ]
  })

  return {
    commandGroups,
    version,
    currentTeam,
    subMenuState,
    deactivateSubMenu
  }
}
