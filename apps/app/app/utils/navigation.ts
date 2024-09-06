type Where = 'home' | 'app'| 'admin';

export type Navigation = {
  name: string;
  title: string;
  to: string;
  icon: string;
};

export function getNavigation(where: Where): Navigation[] {
  switch (where) {
    case 'home':
      return [
        { name: 'Home', to: '/', icon: 'heroicons:home', title: 'Home' },
        /*{ name: 'Changelog', to: '/changelog', icon: 'i-heroicons-document-text', title: 'Changelog' },*/
        { name: 'Docs', to: '/docs', icon: 'heroicons:book-open', title: 'Docs' },
        { name: 'Roadmap', to: '/roadmap', icon: 'heroicons:clipboard-list', title: 'Roadmap' },
      ]
    case 'app':
      return [
        {
          name: 'Projects',
          to: '/app/projects',
          icon: 'lucide:folder',
          title: 'Projects',
        },
        {
          name: 'Teams',
          to: '/app/teams',
          icon: 'lucide:users',
          title: 'Teams',
        },
        {
          name: 'Profile',
          to: '/app/profile',
          icon: 'heroicons:user-circle',
          title: 'Profile',
        },
        {
          name: 'Tokens',
          to: '/app/tokens',
          icon: 'heroicons:key',
          title: 'Tokens',
        },
        {
          name: 'Settings',
          to: '/app/settings',
          icon: 'heroicons:cog',
          title: 'Settings',
        },
      ]
    case 'admin':
      return [
        {
          name: 'Users',
          to: '/app/admin/users',
          icon: 'heroicons:users',
          title: 'Users',
        },
      ]
    default:
      return []
  }
}
