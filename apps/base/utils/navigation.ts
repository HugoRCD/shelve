type Where = 'home' | 'team' | 'user' | 'admin';

export type Navigation = {
  name: string;
  title: string;
  path: string;
  icon?: string;
};

export function getNavigation(where: Where, teamSlug?: string): Navigation[] {
  switch (where) {
    case 'home':
      return [
        { name: 'Home', path: '/', title: 'Home' },
        { name: 'Vault', path: '/vault', title: 'Vault' },
        { name: 'Docs', path: 'https://docs.shelve.cloud', title: 'Docs' },
        { name: 'Roadmap', path: '/roadmap', title: 'Roadmap' },
      ]
    case 'team':
      return [
        {
          name: 'Projects',
          path: `/${teamSlug}`,
          icon: 'lucide:folder',
          title: 'Projects',
        },
        {
          name: 'Members',
          path: `/${teamSlug}/members`,
          icon: 'lucide:users',
          title: 'Members',
        },
        {
          name: 'Environments',
          path: `/${teamSlug}/environments`,
          icon: 'lucide:cloud',
          title: 'Environments',
        },
        {
          name: 'Settings',
          path: `/${teamSlug}/settings`,
          icon: 'heroicons:cog',
          title: 'Settings',
        },
      ]
    case 'user':
      return [
        {
          name: 'Profile',
          path: '/user/profile',
          icon: 'heroicons:user-circle',
          title: 'Profile',
        },
        {
          name: 'API Tokens',
          path: '/user/tokens',
          icon: 'heroicons:key',
          title: 'API Tokens',
        },
        {
          name: 'Integrations',
          path: '/user/integrations',
          icon: 'lucide:blocks',
          title: 'Integrations',
        },
        {
          name: 'Settings',
          path: '/user/settings',
          icon: 'heroicons:cog',
          title: 'Settings',
        },
      ]
    case 'admin':
      return [
        {
          name: 'Users',
          path: '/admin/users',
          icon: 'heroicons:users',
          title: 'Users',
        },
        {
          name: 'Tests',
          path: '/admin/tests',
          icon: 'lucide:flask-conical',
          title: 'Tests',
        },
      ]
    default:
      return []
  }
}
