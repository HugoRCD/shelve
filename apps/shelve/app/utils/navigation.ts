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
          name: 'Team',
          to: `/${teamSlug}/team/members`,
          icon: 'nucleo:users',
          title: 'Team',
        },
        {
          name: 'Environments',
          to: `/${teamSlug}/environments`,
          icon: 'nucleo:cloud',
          title: 'Environments',
        },
      ]
    case 'user':
      return [
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
