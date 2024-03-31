The Shelve CLI serves as a command-line interface designed for the [Shelve](https://shelve.hrcd.fr/) platform. This tool enables users to authenticate with Shelve, facilitating the seamless transfer of environment variables for project collaboration within a team directly through the terminal interface.

## Installation

Install the package globally:

```sh
npm install -g @shelve/cli
```

## Usage

```bash
USAGE shelve <command|shortcut> [options]

| Commands | Description                                          | Shortcut  |
|----------|------------------------------------------------------|-----------|
| create   | Create a new Shelve project                          | c         |
| init     | alias for create                                     | i         |
| upgrade  | Upgrade the Shelve CLI to the latest version         | u         |
| link     | Link the current directory with a Shelve project     | l         |
| unlink   | Unlink the current directory from a Shelve project   | ul        |
| login    | Authenticate with Shelve                             | li        |
| logout   | Logout the current authenticated user                | lo        |
| whoami   | Shows the username of the currently logged-in user   | w         |
| pull     | Retrieve the environment variables from Shelve       | pl        |
| push     | Send the environment variables to Shelve             | ps        |
| open     | Open the current project in the browser              | o         |

Use shelve <command|shortcut> --help for more information about a command.
```

<!-- automd:fetch url="gh:hugorcd/markdown/main/src/local_development.md" -->

### Local development

- Clone this repository
- Install latest LTS version of [Node.js](https://nodejs.org/en/)
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable`
- Install dependencies using `bun install`

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

<!-- automd:contributors license=Apache author=HugoRCD github="hugorcd/shelve" -->

Published under the [APACHE](https://github.com/hugorcd/shelve/blob/main/LICENSE) license.
Made by [@HugoRCD](https://github.com/HugoRCD) and [community](https://github.com/hugorcd/shelve/graphs/contributors) 💛
<br><br>
<a href="https://github.com/hugorcd/shelve/graphs/contributors">
<img src="https://contrib.rocks/image?repo=hugorcd/shelve" />
</a>

<!-- /automd -->

<!-- automd:with-automd lastUpdate -->

---

_🤖 auto updated with [automd](https://automd.unjs.io) (last updated: Sat Mar 30 2024)_

<!-- /automd -->
