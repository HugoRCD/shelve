<img src="../../assets/cover.png" width="100%" alt="Shelve" />

# Shelve CLI

<!-- automd:badges color=black license provider=shields name=@shelve/cli -->

[![npm version](https://img.shields.io/npm/v/@shelve/cli?color=black)](https://npmjs.com/package/@shelve/cli)
[![npm downloads](https://img.shields.io/npm/dm/@shelve/cli?color=black)](https://npm.chart.dev/@shelve/cli)
[![license](https://img.shields.io/github/license/HugoRCD/shelve?color=black)](https://github.com/HugoRCD/shelve/blob/main/LICENSE)

<!-- /automd -->

The Shelve CLI serves as a command-line interface designed for the [Shelve](https://shelve.cloud/) platform. This tool enables users to authenticate with Shelve, facilitating the seamless transfer of environment variables for project collaboration within a team directly through the terminal interface.

## Installation

Install the package locally:

```sh
bun a -d @shelve/cli
```

## Configuration

Configuration is loaded from cwd. You can use either `shelve.json`, `shelve.config.json`, but running the CLI without any configuration will create a `shelve.json` file.

The CLI also has a json schema for the configuration file. that can be used to validate the configuration file. (see it [here](https://raw.githubusercontent.com/HugoRCD/shelve/main/packages/types/schema.json))

### Configuration example

```json
{
  "slug": "nuxtlabs",
  "project": "@nuxt/ui",
  "confirmChanges": true,
  "autoCreateProject": true
}
```

### Monorepo configuration

If you are using a monorepo, Shelve will automatically detect the root of the monorepo and look for the global `shelve.json` file. You can define here common configurations for all the projects in the monorepo (the team slug for example).

## Usage

Global flags (usable before or after the subcommand):

- `--json` — machine-readable stdout / structured stderr errors
- `--quiet` / `-q` — minimal output (no spinners)
- `--yes` / `-y` — skip confirmations
- `--non-interactive` — fail instead of prompting (also auto-enabled in CI / AI agent shells)
- `--debug` — verbose logging (`SHELVE_DEBUG=1`)

See [CLI agents & automation](https://shelve.cloud/docs/cli/agents-automation) on shelve.cloud for the full contract (JSON shapes, exit codes, env vars). Install the agent skill: `npx skills add https://shelve.cloud`.

```bash
Shelve CLI (shelve v5)

USAGE shelve run|push|pull|login|logout|me|init|create|config|generate|upgrade

COMMANDS

       run    Inject secrets into a child process (no .env on disk)
      push    Push variables for specified environment to Shelve
      pull    Pull variables for specified environment from Shelve
     login    Login to Shelve
    logout    Logout from Shelve locally
        me    Show the currently logged-in user
      init    Add agent ignore files and shelve-managed .gitignore block
    create    Create a new project and its config
    config    Show the current configuration
  generate    Generate resources for a project
   upgrade    Upgrade the Shelve CLI to the latest version

Use shelve <command> --help for more information about a command.
```

### Agents & automation

Prefer `shelve run -- <cmd>` over `shelve pull`. Set `SHELVE_TOKEN`, `SHELVE_TEAM_SLUG`, and `SHELVE_PROJECT` for non-interactive use. Example:

```bash
shelve --json config
shelve --non-interactive --yes push --env staging
shelve run -- pnpm dev
```

### Monorepo usage

In a monorepo, local `shelve.json` is merged with the root config (shared team slug, etc.). Commands run in the current package directory; they do not automatically iterate all packages.

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
6. If your changes affect the code, run tests using `pnpm run test`.
7. Create a pull request following the [Pull Request Template](https://github.com/HugoRCD/markdown/blob/main/src/pull_request_template.md).
   - To be merged, the pull request must pass the tests/workflow and have at least one approval.
   - If your changes affect the documentation, make sure to update it.
   - If your changes affect the code, make sure to update the tests.
8. Wait for the maintainers to review your pull request.
9. Once approved, the pull request will be merged in the next release !

<!-- /automd -->

<!-- automd:fetch url="gh:hugorcd/markdown/main/src/sponsors.md" -->

## Sponsors

<p align="center">
  <a href="https://github.com/sponsors/HugoRCD">
    <img src='https://cdn.jsdelivr.net/gh/hugorcd/static/sponsors.svg' alt="HugoRCD sponsors" />
  </a>
</p>

<!-- /automd -->

<!-- automd:contributors license=Apache author=HugoRCD github=HugoRCD/shelve -->

Published under the [APACHE](https://github.com/HugoRCD/shelve/blob/main/LICENSE) license.
Made by [@HugoRCD](https://github.com/HugoRCD) and [community](https://github.com/HugoRCD/shelve/graphs/contributors) 💛
<br><br>
<a href="https://github.com/HugoRCD/shelve/graphs/contributors">
<img src="https://contrib.rocks/image?repo=HugoRCD/shelve" />
</a>

<!-- /automd -->

<!-- automd:with-automd lastUpdate -->

---

_🤖 auto updated with [automd](https://automd.unjs.io) (last updated: Sat Apr 05 2025)_

<!-- /automd -->
