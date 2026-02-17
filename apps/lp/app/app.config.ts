export default defineAppConfig({
  ui: {
    icons: {
      external: 'lucide:arrow-up-right',
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
