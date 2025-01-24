---
title: Config
description: Show the current configuration.
---

The `config` command allows you to view the current configuration of Shelve CLI. When you run the `config` command, Shelve CLI will display the current configuration, including the token, the base URL, and everything else that will be used to interact with Shelve.

```bash [terminal]
shelve config
```

Example output:

```bash [terminal]
{
  slug: 'hrcd',
  project: 'shelve',
  token: 'your-token',
  url: 'https://app.shelve.cloud',
  username: 'your-username',
  email: 'your-email',
  confirmChanges: false,
  envFileName: '.env',
  autoUppercase: true,
  autoCreateProject: true,
  monorepo: {
    paths: [
      '/Users/username/Dev/shelve',
      '/Users/username/Dev/shelve/apps/base',
      '/Users/username/Dev/shelve/apps/lp',
      '/Users/username/Dev/shelve/apps/shelve',
      '/Users/username/Dev/shelve/packages/cli',
      '/Users/username/Dev/shelve/packages/utils',
      '/Users/username/Dev/shelve/packages/types'
    ]
  },
  workspaceDir: '/Users/username/Dev/shelve',
  isMonoRepo: true,
  isRoot: false,
  '$schema': 'https://raw.githubusercontent.com/HugoRCD/shelve/main/packages/types/schema.json'
}
```
