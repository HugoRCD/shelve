type Where = 'home' | 'app'| 'admin';

export type Navigation = {
  name: string;
  title: string;
  path: string;
  icon: string;
};

export function getNavigation(where: Where): Navigation[] {
  switch (where) {
    case 'home':
      return [
        { name: 'Home', path: '/', icon: 'heroicons:home', title: 'Home' },
        { name: 'EnvShare', path: '/envshare', icon: 'lucide:share', title: 'EnvShare' },
        /*{ name: 'Changelog', path: '/changelog', icon: 'i-heroicons-document-text', title: 'Changelog' },*/
        { name: 'Docs', path: '/docs', icon: 'heroicons:book-open', title: 'Docs' },
        { name: 'Roadmap', path: '/roadmap', icon: 'heroicons:clipboard-list', title: 'Roadmap' },
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
