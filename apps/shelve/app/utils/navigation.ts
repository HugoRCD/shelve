type Where = 'team' | 'user' | 'admin';

export type Navigation = {
  name: string;
  title: string;
  path: string;
  icon: string;
};

export function getNavigation(where: Where): Navigation[] {
  switch (where) {
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
