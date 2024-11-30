type Where = 'home' | 'team' | 'user' | 'admin';

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
    case 'team':
      return [
        {
          name: 'Projects',
          path: '/',
          icon: 'lucide:folder',
          title: 'Projects',
        },
        {
          name: 'Members',
          path: '/members',
          icon: 'lucide:users',
          title: 'Members',
        },
        {
          name: 'Environments',
          path: '/environments',
          icon: 'lucide:cloud',
          title: 'Environments',
        },
        {
          name: 'Tokens',
          path: '/tokens',
          icon: 'heroicons:key',
          title: 'Tokens',
        },
        {
          name: 'Settings',
          path: '/settings',
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
