# Shelve CLI

<p align="left">
  <a aria-label="NPM version" href="https://www.npmjs.com/package/@shelve/cli">
    <img alt="" src="https://img.shields.io/npm/v/shelve.svg?style=for-the-badge&labelColor=000000&color=E0E0E0">
  </a>
  <a aria-label="License" href="https://github.com/HugoRCD/shelve/blob/main/LICENSE">
    <img alt="" src="https://img.shields.io/npm/l/shelve.svg?style=for-the-badge&labelColor=000000&color=212121">
  </a>
  <a aria-label="Follow Hugo on Twitter" href="https://twitter.com/HugoRCD__">
    <img alt="" src="https://img.shields.io/twitter/follow/HugoRCD__.svg?style=for-the-badge&labelColor=000000&logo=twitter&label=Follow%20Hugo&logoWidth=20&logoColor=white">
  </a>
</p>

The Shelve CLI is a command-line interface for the [Shelve](https://shelve.hrcd.fr/) platform. It allows you to authenticate with Shelve, pull and push environment variables for your projects
with your team and without leaving your terminal.

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

## Contribution

<details>
  <summary>Local development</summary>

- Clone this repository
- Install the latest LTS version of [Node.js](https://nodejs.org/en/)
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable`
- Install dependencies using `bun install`
- Run the CLI using `bun ./src/index.ts`

</details>

<!-- automd:contributors license=MIT author="HugoRCD" -->

Published under the [MIT](https://github.com/HugoRCD/shelve/blob/main/LICENSE) license.
Made by [@HugoRCD](https://github.com/HugoRCD) and [community](https://github.com/HugoRCD/shelve/graphs/contributors) 💛
<br><br>
<a href="https://github.com/HugoRCD/shelve/graphs/contributors">
<img src="https://contrib.rocks/image?repo=HugoRCD/shelve" />
</a>

<!-- /automd -->

<!-- automd:with-automd -->

---

_🤖 auto updated with [automd](https://automd.unjs.io)_

<!-- /automd -->
