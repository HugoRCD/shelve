<img src="assets/preview.png" width="100%" alt="Shelve" />

# Shelve

<!-- automd:badges color=black license provider=shields name=@shelve/cli -->

[![npm version](https://img.shields.io/npm/v/@shelve/cli?color=black)](https://npmjs.com/package/@shelve/cli)
[![npm downloads](https://img.shields.io/npm/dm/@shelve/cli?color=black)](https://npm.chart.dev/@shelve/cli)
[![license](https://img.shields.io/github/license/HugoRCD/shelve?color=black)](https://github.com/HugoRCD/shelve/blob/main/LICENSE)

<!-- /automd -->

The Shelve CLI serves as a command-line interface designed for the [Shelve](https://shelve.hrcd.fr/) platform. This tool enables users to authenticate with Shelve, facilitating the seamless transfer of environment variables for project collaboration within a team directly through the terminal interface.

## Installation

Install the package globally:

```sh
npm install -g @shelve/cli
```

## Configuration

Configuration is loaded by [unjs/c12](https://github.com/unjs/c12) from cwd. You can use either `shelve.config.json`, `shelve.config.{ts,js,mjs,cjs}` or use the `shelve` field in `package.json`.
You have the option to create a `shelve.config.ts` file to enable type checking and autocompletion. The file should contain the following content:

```ts title="shelve.config.ts"
import { createShelveConfig } from "@shelve/cli"

export default createShelveConfig({
  project: "my-project", // only required field
  token: "my-token",
  url: "https://shelve.hrcd.fr",
  confirmChanges: false,
  pushMethod: 'overwrite',
  pullMethod: 'overwrite',
  envFileName: '.env',
  autoUppercase: true,
})
```

The CLI also has a json schema for the configuration file. that can be used to validate the configuration file. (see it [here](https://raw.githubusercontent.com/HugoRCD/shelve/main/packages/types/shelve-config-schema.json))

## Usage

```bash
Usage: shelve [options] [command]

The command-line interface for Shelve

Options:
  -V, --version       output the version number
  -h, --help          display help for command

Commands:
  create|c [options]  Create a new project
  pull|pl [options]   Pull variables for specified environment to .env file
  push|ps [options]   Push variables for specified environment to Shelve
  generate|g          Generate resources for a project
  upgrade|u           Upgrade the Shelve CLI to the latest version
  config|cf           Show the current configuration
  help [command]      display help for command
```

<!-- automd:fetch url="gh:hugorcd/markdown/main/src/local_development.md" -->

<details>
  <summary>Local development</summary>

- Clone this repository
- Install latest LTS version of [Node.js](https://nodejs.org/en/)
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable`
- Install dependencies using `bun install`

</details>

<!-- /automd -->

<!-- automd:fetch url="gh:hugorcd/markdown/main/src/contributions.md" -->

## Contributing
To start contributing, you can follow these steps:

1. First raise an issue to discuss the changes you would like to make.
2. Fork the repository.
3. Create a branch using conventional commits and the issue number as the branch name. For example, `feat/123` or `fix/456`.
4. Make changes following the local development steps.
5. Commit your changes following the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.
6. If your changes affect the code, run tests using `bun run test`.
7. Create a pull request following the [Pull Request Template](https://github.com/HugoRCD/markdown/blob/main/src/pull_request_template.md).
   - To be merged, the pull request must pass the tests/workflow and have at least one approval.
   - If your changes affect the documentation, make sure to update it.
   - If your changes affect the code, make sure to update the tests.
8. Wait for the maintainers to review your pull request.
9. Once approved, the pull request will be merged in the next release !

<!-- /automd -->

<!-- automd:contributors license=Apache author=HugoRCD,CavallucciJohann -->

Published under the [APACHE](https://github.com/HugoRCD/shelve/blob/main/LICENSE) license.
Made by [@HugoRCD](https://github.com/HugoRCD), [@CavallucciJohann](https://github.com/CavallucciJohann) and [community](https://github.com/HugoRCD/shelve/graphs/contributors) 💛
<br><br>
<a href="https://github.com/HugoRCD/shelve/graphs/contributors">
<img src="https://contrib.rocks/image?repo=HugoRCD/shelve" />
</a>

<!-- /automd -->

<!-- automd:with-automd lastUpdate -->

---

_🤖 auto updated with [automd](https://automd.unjs.io) (last updated: Fri Oct 11 2024)_

<!-- /automd -->
