export default defineAppConfig({
  ui: {
    colors: {
      primary: 'blue',
      neutral: 'neutral',
    },
    button: {
      slots: {
        // @ts-expect-error Nuxt UI types error
        base: 'cursor-pointer'
      }
    },
    icons: {
      loading: 'lucide:loader',
    },
    card: {
      slots: {
        header: 'p-4 sm:p-4',
        footer: 'p-4 sm:p-4',
        body: 'p-4 sm:p-4',
      }
    }
  },
  title: 'Shelve',
  description: 'Shelve, is a project management tool for developers, etc... to make project creation and management easier.',
  ogImage: 'https://shelve.cloud/og.png',
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
