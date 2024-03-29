# Shelve CLI

<!-- automd:badges color=black license provider=shields -->

[![npm version](https://img.shields.io/npm/v/@shelve/cli?color=black)](https://npmjs.com/package/@shelve/cli)
[![npm downloads](https://img.shields.io/npm/dm/@shelve/cli?color=black)](https://npmjs.com/package/@shelve/cli)
[![license](https://img.shields.io/github/license/HugoRCD/shelve?color=black)](https://github.com/HugoRCD/shelve/blob/main/LICENSE)

<!-- /automd -->

The Shelve CLI serves as a command-line interface designed for the [Shelve](https://shelve.hrcd.fr/) platform. This tool enables users to authenticate with Shelve, facilitating the seamless transfer of environment variables for project collaboration within a team directly through the terminal interface.

## Installation

Install the package globally:

```sh
npm install -g @shelve/cli
```

## Usage

```bash
USAGE shelve upgrade|login|logout|whoami|pull|push

COMMANDS

  upgrade   Upgrade the Shelve CLI to the latest version
  link      Link the current directory with a Shelve project
  unlink    Unlink the current directory from a Shelve project
  login     Authenticate with Shelve
  logout    Logout the current authenticated user
  whoami    Shows the username of the currently logged in user
  pull      Retrieve the environement variables from Shelve
  push      Send the environement variables to Shelve
  open      Open the current project in the browser

Use shelve <command> --help for more information about a command.
```

### Local development

- Clone this repository
- Install latest LTS version of [Node.js](https://nodejs.org/en/)
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable`
- Install dependencies using `bun install`
- Start development server using `bun dev`
- Open [http://localhost:3000](http://localhost:3000) in your browser

## Contributing
To start contributing, you can follow these steps:

1. First raise an issue to discuss the changes you would like to make.
2. Fork the repository.
3. Create a branch using the ticket number like `feature/123` or `fix/123`.
4. Make changes following the local development steps [above](#local-development).
5. Commit your changes following the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.
6. Run tests using `bun run test`.
7. Create a pull request following the [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md).
   - To be merged, the pull request must pass the tests/workflow and have at least one approval.
   - If your changes affect the documentation, make sure to update it.
   - If your changes affect the code, make sure to update the tests.
8. Wait for the maintainers to review your pull request.
9. Once approved, the pull request will be merged in the next release !

<!-- automd:contributors license=Apache author="HugoRCD" -->

Published under the [APACHE](https://github.com/HugoRCD/shelve/blob/main/LICENSE) license.
Made by [@HugoRCD](https://github.com/HugoRCD) and [community](https://github.com/HugoRCD/shelve/graphs/contributors) 💛
<br><br>
<a href="https://github.com/HugoRCD/shelve/graphs/contributors">
<img src="https://contrib.rocks/image?repo=HugoRCD/shelve" />
</a>

<!-- /automd -->

<!-- automd:with-automd lastUpdate -->

---

_🤖 auto updated with [automd](https://automd.unjs.io) (last updated: Thu Mar 28 2024)_

<!-- /automd -->
