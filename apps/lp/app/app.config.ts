export default defineAppConfig({
  ui: {
    icons: {
      external: 'lucide:arrow-up-right',
    }
  },
  uiPro: {
    prose: {
      codeIcon: {
        'shelve.json': 'custom:shelve',
        'docker-compose.yml': 'simple-icons:docker'
      },
      a: {
        base: 'border-b border-secondary'
      }
    },
    pageSection: {
      slots: {
        container: 'py-10 sm:py-10 lg:py-16',
      }
    }
  },
  socials: {
    github: 'https://github.com/HugoRCD',
    twitter: 'https://x.com/hugorcd',
  },
  toc: {
    bottom: {
      title: 'Resources',
      links: [
        {
          icon: 'i-lucide-file-text',
          label: 'llms.txt',
          to: '/llms.txt',
          target: '_blank',
        },
        {
          icon: 'i-lucide-heart-handshake',
          label: 'Contributing',
          to: '/docs/contributing',
        },
        {
          icon: 'i-lucide-cpu',
          label: 'MCP Server',
          to: '/mcp/deeplink',
          external: true,
        }
      ],
    },
  },
})
