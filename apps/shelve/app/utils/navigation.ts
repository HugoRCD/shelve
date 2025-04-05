import type { Navigation } from '@types'

type Where = 'team' | 'user' | 'admin';


export function getNavigation(where: Where, teamSlug?: string): Navigation[] {
  switch (where) {
    case 'team':
      return [
        {
          name: 'Projects',
          to: `/${teamSlug}`,
          icon: 'nucleo:house',
          title: 'Projects',
        },
        {
          name: 'Members',
          to: `/${teamSlug}/members`,
          icon: 'nucleo:users',
          title: 'Members',
        },
        {
          name: 'Environments',
          to: `/${teamSlug}/environments`,
          icon: 'nucleo:cloud',
          title: 'Environments',
        },
        {
          name: 'Settings',
          to: `/${teamSlug}/settings`,
          icon: 'nucleo:gear-2',
          title: 'Settings',
        },
      ]
    case 'user':
      return [
        {
          name: 'Profile',
          to: '/user/profile',
          icon: 'nucleo:user',
          title: 'Profile',
        },
        {
          name: 'API Tokens',
          to: '/user/tokens',
          icon: 'nucleo:key',
          title: 'API Tokens',
        },
        {
          name: 'Integrations',
          to: '/user/integrations',
          icon: 'nucleo:algorithm',
          title: 'Integrations',
        },
        {
          name: 'Settings',
          to: '/user/settings',
          icon: 'nucleo:gear-2',
          title: 'Settings',
        },
      ]
    case 'admin':
      return [
        {
          name: 'Dashboard',
          to: '/admin',
          icon: 'nucleo:shield-check',
          title: 'Dashboard',
        },
        {
          name: 'Tests',
          to: '/admin/tests',
          icon: 'nucleo:list-checkbox',
          title: 'Tests',
        },
      ]
    default:
      return []
  }
}
