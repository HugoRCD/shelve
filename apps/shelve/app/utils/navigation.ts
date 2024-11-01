type Where = 'home' | 'app'| 'admin';

export type Navigation = {
  name: string;
  title: string;
  path: string;
  icon?: string;
};

export function getNavigation(where: Where): Navigation[] {
  switch (where) {
    case 'home':
      return [
        { name: 'Home', path: '/', title: 'Home' },
        { name: 'Vault', path: '/vault', title: 'Vault' },
        /*{ name: 'Changelog', path: '/changelog', icon: 'i-heroicons-document-text', title: 'Changelog' },*/
        { name: 'Docs', path: '/docs', title: 'Docs' },
        { name: 'Roadmap', path: '/roadmap', title: 'Roadmap' },
      ]
    case 'app':
      return [
        {
          name: 'Projects',
          path: '/app/projects',
          icon: 'lucide:folder',
          title: 'Projects',
        },
        {
          name: 'Teams',
          path: '/app/teams',
          icon: 'lucide:users',
          title: 'Teams',
        },
        {
          name: 'Profile',
          path: '/app/profile',
          icon: 'heroicons:user-circle',
          title: 'Profile',
        },
        {
          name: 'Tokens',
          path: '/app/tokens',
          icon: 'heroicons:key',
          title: 'Tokens',
        },
        {
          name: 'Settings',
          path: '/app/settings',
          icon: 'heroicons:cog',
          title: 'Settings',
        },
      ]
    case 'admin':
      return [
        {
          name: 'Users',
          path: '/app/admin/users',
          icon: 'heroicons:users',
          title: 'Users',
        },
      ]
    default:
      return []
  }
}
