export default defineAppConfig({
  ui: {
    primary: 'accent',
    gray: 'neutral',
    button: {
      default: {
        size: 'xs',
        loadingIcon: 'lucide:loader',
      }
    },
    card: {
      body: {
        padding: 'p-3 sm:p-3',
      },
      header: {
        padding: 'p-3 sm:p-3',
      },
      footer: {
        padding: 'p-3 sm:p-3',
      },
    }
  },
  title: 'Shelve',
  description: 'Shelve, is a project management tool for developers, designers, etc... to make project creation and management easier.',
  email: 'contact@hrcd.fr',
  phone: '(+33) 6 21 56 22 18',
  socials: [
    { name: 'github', link: 'https://github.com/HugoRCD' },
    { name: 'twitter', link: 'https://twitter.com/HugoRCD__' },
    { name: 'linkedin', link: 'https://www.linkedin.com/in/hugo-richard-0801' },
    { name: 'instagram', link: 'https://www.instagram.com/hugo.rcd_' },
    { name: 'spotify', link: 'https://open.spotify.com/user/yuvl0zpp3bpx4hne1ag7huten?si=df7ee2777c0c4fc4' }
  ],
  link: [
    {
      rel: 'icon',
      type: 'image/x-icon',
      href: '/favicon.ico',
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      href: '/apple-touch-icon.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      href: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      href: '/favicon-16x16.png',
    },
    {
      rel: 'manifest',
      href: '/site.webmanifest',
    },
  ],
})
