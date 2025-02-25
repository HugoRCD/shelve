import type { Navigation } from '@types'

type Where = 'team' | 'user' | 'admin';


export function getNavigation(where: Where, teamSlug?: string): Navigation[] {
  switch (where) {
    case 'team':
      return [
        {
          name: 'Projects',
          to: `/${teamSlug}`,
          icon: 'lucide:folders',
          title: 'Projects',
        },
        {
          name: 'Members',
          to: `/${teamSlug}/members`,
          icon: 'lucide:users',
          title: 'Members',
        },
        {
          name: 'Environments',
          to: `/${teamSlug}/environments`,
          icon: 'lucide:cloud',
          title: 'Environments',
        },
        {
          name: 'Settings',
          to: `/${teamSlug}/settings`,
          icon: 'heroicons:cog',
          title: 'Settings',
        },
      ]
    case 'user':
      return [
        {
          name: 'Profile',
          to: '/user/profile',
          icon: 'heroicons:user-circle',
          title: 'Profile',
        },
        {
          name: 'API Tokens',
          to: '/user/tokens',
          icon: 'heroicons:key',
          title: 'API Tokens',
        },
        {
          name: 'Integrations',
          to: '/user/integrations',
          icon: 'lucide:blocks',
          title: 'Integrations',
        },
        {
          name: 'Settings',
          to: '/user/settings',
          icon: 'heroicons:cog',
          title: 'Settings',
        },
      ]
    case 'admin':
      return [
        {
          name: 'Dashboard',
          to: '/admin',
          icon: 'heroicons:home',
          title: 'Dashboard',
        },
        {
          name: 'Tests',
          to: '/admin/tests',
          icon: 'lucide:flask-conical',
          title: 'Tests',
        },
      ]
    default:
      return []
  }
}
