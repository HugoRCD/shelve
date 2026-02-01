import type { CommandGroup, CommandItem, SubMenuState } from '@types'
import type { Project } from '@types'

export function useAppCommands() {
  const teams = useTeams()
  const colorMode = useColorMode()
  const { version } = useRuntimeConfig().public
  const { selectTeam, fetchTeams } = useTeamsService()
  const route = useRoute()

  if (!teams.value || teams.value.length === 0) {
    fetchTeams()
  }

  // Fetch projects for all teams
  async function fetchAllProjects() {
    if (!teams.value || teams.value.length === 0) return

    await Promise.all(teams.value.map(async (team) => {
      try {
        const projects = useProjects(team.slug)
        if (!projects.value || projects.value.length === 0) {
          projects.value = await $fetch<Project[]>(`/api/teams/${team.slug}/projects`)
        }
      } catch (error) {
        console.error(`Failed to fetch projects for ${team.slug}:`, error)
      }
    }))
  }

  // Eagerly fetch projects when teams are available
  watch(teams, (newTeams) => {
    if (newTeams && newTeams.length > 0) {
      fetchAllProjects()
    }
  }, { immediate: true })

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

  const currentTeam = computed(() => {
    if (!teams.value || teams.value.length === 0) {
      return null
    }
    
    const teamSlug = route.params.teamSlug as string
    if (!teamSlug) {
      return teams.value[0] || null
    }
    
    return teams.value.find((team) => team.slug === teamSlug) || teams.value[0] || null
  })

  const getTeamSlug = () => {
    return currentTeam.value?.slug || teams.value[0]?.slug
  }

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
      icon: 'lucide:settings',
      description: 'Manage team settings',
      action: () => {
        const teamSlug = getTeamSlug()
        if (teamSlug) {
          navigateTo(`/${teamSlug}/team/settings`)
        }
      },
      keywords: ['team', 'organization', 'settings', 'preferences'],
      active: route.path.includes('/team/settings'),
      disabled: !getTeamSlug()
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
        const teamSlug = getTeamSlug()
        if (teamSlug) {
          navigateTo(`/${teamSlug}/environments`)
        }
      },
      keywords: ['environments', 'all', 'list'],
      active: route.path === `/${getTeamSlug()}/environments`,
      disabled: !getTeamSlug()
    },
    {
      id: 'env-create',
      label: 'Create Environment',
      icon: 'lucide:plus-circle',
      description: 'Create a new environment',
      action: () => {
        const teamSlug = getTeamSlug()
        if (teamSlug) {
          navigateTo(`/${teamSlug}/environments/new`)
        }
      },
      keywords: ['environment', 'create', 'new', 'add'],
      active: route.path === `/${getTeamSlug()}/environments/new`,
      disabled: !getTeamSlug()
    },
    {
      id: 'env-production',
      label: 'Production Environment',
      icon: 'lucide:globe',
      description: 'View production environment',
      action: () => {
        const teamSlug = getTeamSlug()
        if (teamSlug) {
          navigateTo(`/${teamSlug}/environments/production`)
        }
      },
      keywords: ['environment', 'production', 'live'],
      active: route.path.includes('/environments/production'),
      disabled: !getTeamSlug()
    },
    {
      id: 'env-staging',
      label: 'Staging Environment',
      icon: 'lucide:flask-conical',
      description: 'View staging environment',
      action: () => {
        const teamSlug = getTeamSlug()
        if (teamSlug) {
          navigateTo(`/${teamSlug}/environments/staging`)
        }
      },
      keywords: ['environment', 'staging', 'test'],
      active: route.path.includes('/environments/staging'),
      disabled: !getTeamSlug()
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
        const teamSlug = getTeamSlug()
        if (teamSlug) {
          navigateTo(`/${teamSlug}`)
        }
      },
      keywords: ['home', 'dashboard', 'main'],
      active: route.path === `/${getTeamSlug()}`,
      disabled: !getTeamSlug()
    },
    {
      id: 'nav-environments',
      label: 'Environments',
      icon: 'lucide:cloud',
      description: 'Manage environments',
      action: () => {
        const teamSlug = getTeamSlug()
        if (teamSlug) {
          navigateTo(`/${teamSlug}/environments`)
        }
      },
      keywords: ['environments', 'projects', 'variables'],
      active: route.path.includes('/environments'),
      disabled: !getTeamSlug()
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
      active: team.slug === route.params.teamSlug,
    }))
  })

  // Project commands - all projects from all teams
  const projectCommands = computed<CommandItem[]>(() => {
    if (!teams.value || teams.value.length === 0) return []

    const currentTeamSlug = getTeamSlug()
    const allProjects: CommandItem[] = []

    // useProjects returns useState keyed by slug - safe to call in computed
    for (const team of teams.value) {
      const projects = useProjects(team.slug)
      if (!projects.value || projects.value.length === 0) continue

      const isCurrentTeam = team.slug === currentTeamSlug
      for (const project of projects.value) {
        allProjects.push({
          id: `project-${project.id}`,
          label: project.name,
          icon: project.logo || 'lucide:folder',
          isAvatar: Boolean(project.logo),
          suffix: isCurrentTeam ? undefined : team.name,
          description: isCurrentTeam ? undefined : `in ${team.name}`,
          action: () => navigateTo(`/${team.slug}/projects/${project.id}`),
          keywords: ['project', 'switch', project.name, team.name],
          active: route.params.projectId === String(project.id),
        })
      }
    }

    // Hide if only 1 project total
    if (allProjects.length <= 1) return []

    return allProjects
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
      disabled: !currentTeam.value?.id
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

    // Filter out empty command groups
    const groups = []

    // Only show teams if available
    if (teams.value && teams.value.length > 0) {
      groups.push({
        id: 'teams',
        label: 'Teams',
        items: teamCommands.value
      })
    }

    // Only show projects if available
    if (projectCommands.value.length > 0) {
      groups.push({
        id: 'projects',
        label: 'Projects',
        items: projectCommands.value
      })
    }

    // Only show navigation if we have teams
    if (teams.value && teams.value.length > 0) {
      groups.push({
        id: 'navigation',
        label: 'Navigation',
        items: navigationCommands.value
      })
    }

    // Always show theme commands
    groups.push({
      id: 'theme',
      label: 'Theme',
      items: themeCommands.value
    })

    // Always show help commands
    groups.push({
      id: 'help',
      label: 'Help & Support',
      items: helpCommands.value
    })

    // Always show utility commands
    groups.push({
      id: 'utility',
      label: 'Utilities',
      items: utilityCommands.value
    })

    return groups
  })

  return {
    commandGroups,
    version,
    currentTeam,
    subMenuState,
    deactivateSubMenu
  }
}
