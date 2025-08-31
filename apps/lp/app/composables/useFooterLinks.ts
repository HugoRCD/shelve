import type { FooterColumn } from '@nuxt/ui'

export const useFooterLinks = () => {
  const footerLinks: FooterColumn[] = [
    {
      label: 'Product',
      children: [
        {
          label: 'Features',
          to: '/#features'
        },
        {
          label: 'Roadmap',
          to: '/roadmap'
        },
        {
          label: 'Releases',
          to: 'https://github.com/hugorcd/shelve/releases',
          target: '_blank'
        },
        {
          label: 'Open App',
          to: 'https://app.shelve.cloud',
          target: '_blank'
        }
      ]
    },
    {
      label: 'Resources',
      children: [
        {
          label: 'Documentation',
          to: '/docs/getting-started'
        },
        {
          label: 'Blog',
          to: '/blog'
        },
        {
          label: 'Brand Assets',
          to: '/brand'
        },
        {
          label: 'llms.txt',
          to: 'https://shelve.cloud/llms.txt',
          target: '_blank'
        }
      ]
    },
    {
      label: 'Community',
      children: [
        {
          label: 'GitHub',
          to: 'https://github.com/hugorcd/shelve',
          target: '_blank'
        },
        {
          label: 'X (Twitter)',
          to: 'https://x.com/shelvecloud',
          target: '_blank'
        },
        {
          label: 'Discord',
          to: 'https://discord.gg/shelve',
          target: '_blank'
        },
        {
          label: 'Contributing',
          to: '/docs/contributing'
        }
      ]
    },
    {
      label: 'Legal',
      children: [
        {
          label: 'Privacy Policy',
          to: '/privacy'
        },
        {
          label: 'Terms of Service',
          to: '/terms'
        },
        {
          label: 'Cookie Policy',
          to: '/cookies'
        }
      ]
    }
  ]

  return {
    footerLinks
  }
} 
