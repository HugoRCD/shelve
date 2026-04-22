export default defineAppConfig({
  ui: {
    icons: {
      external: 'lucide:arrow-up-right',
    },
    contentToc: {
      defaultVariants: {
        highlightVariant: 'circuit',
      }
    }
  },
  seo: {
    titleTemplate: '%s - Shelve',
    title: 'Shelve',
    description: 'Open-source secrets management for modern dev teams. Sync, share and audit your environment variables across projects, environments and teammates.',
  },
  github: {
    url: 'https://github.com/hugorcd/shelve',
    rootDir: 'apps/lp',
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
        },
      ],
    },
  },
})
