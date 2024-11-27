<img src="assets/preview.png" width="100%" alt="Shelve" />

# Shelve

<!-- automd:badges color=black license provider=shields name=@shelve/cli -->

[![npm version](https://img.shields.io/npm/v/@shelve/cli?color=black)](https://npmjs.com/package/@shelve/cli)
[![npm downloads](https://img.shields.io/npm/dm/@shelve/cli?color=black)](https://npm.chart.dev/@shelve/cli)
[![license](https://img.shields.io/github/license/HugoRCD/shelve?color=black)](https://github.com/HugoRCD/shelve/blob/main/LICENSE)

<!-- /automd -->

## Project Introduction

### Catchy Title
Shelve: Secure Environment Sharing for Collaborative Development

### Short Description
Shelve is a powerful tool designed to streamline environment management and project collaboration. It enables teams to securely share environment variables and manage project settings with ease.

### Project Vision
Shelve aims to provide a seamless development workspace, efficient environment management, and robust project collaboration tools. Our vision is to create a unified platform that simplifies the development process and enhances team productivity.

### Current Status and Future Ambitions
Shelve is currently in active development, with a focus on adding new features and improving existing functionalities. Our future ambitions include expanding the platform's capabilities, integrating with more tools, and fostering a vibrant open-source community.

## Visual Elements

### Shelve Logo
![Shelve Logo](assets/logo.png)

### Badges for Key Technologies
[![Nuxt](https://img.shields.io/badge/Nuxt-3.0.0-blue)](https://nuxtjs.org/)
[![Nuxt UI v3](https://img.shields.io/badge/Nuxt%20UI-v3-blue)](https://nuxtjs.org/)
[![Tailwind v4](https://img.shields.io/badge/Tailwind-v4-blue)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.0-blue)](https://www.typescriptlang.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-1.0-blue)](https://turborepo.org/)
[![Bun](https://img.shields.io/badge/Bun-1.0-blue)](https://bun.sh/)
[![Docker](https://img.shields.io/badge/Docker-20.10-blue)](https://www.docker.com/)
[![DrizzleORM](https://img.shields.io/badge/DrizzleORM-1.0-blue)](https://drizzle.team/)
[![Resend](https://img.shields.io/badge/Resend-1.0-blue)](https://resend.com/)
[![Zod](https://img.shields.io/badge/Zod-3.0-blue)](https://zod.dev/)

### Key Interface Screenshots
![Screenshot 1](assets/screenshot1.png)
![Screenshot 2](assets/screenshot2.png)

## Key Features

- Secure environment variable sharing
- Project collaboration tools
- Seamless integration with popular development tools
- Robust access control and permissions
- Real-time updates and notifications

### USPs (Unique Selling Points)
- Enhanced security for environment variables
- Streamlined project management
- Easy integration with existing workflows

### Advantages over Existing Solutions
- Comprehensive feature set tailored for development teams
- Focus on security and ease of use
- Active development and community support

## Technical Value Proposition

### Why Shelve is an Excellent Learning Project
Shelve leverages modern technologies and best practices, making it an ideal project for developers to learn and grow.

### Modern Technologies Used
- Nuxt
- Tailwind CSS
- TypeScript
- Turborepo
- Bun
- Docker
- DrizzleORM
- Resend
- Zod

### Patterns and Best Practices
Shelve follows industry-standard patterns and best practices, ensuring maintainable and scalable code.

### Coverage of Different Aspects of Modern Development
Shelve covers various aspects of modern development, including frontend, backend, and DevOps, providing a holistic learning experience.

## Getting Started

### Detailed Prerequisites
- Node.js (latest LTS version)
- Docker
- Git

### Installation Instructions
1. Clone the repository:
    ```sh
    git clone https://github.com/HugoRCD/shelve.git
    cd shelve
    ```

2. Install dependencies:
    ```sh
    bun install
    ```

### Initial Setup
1. Copy the example environment file:
    ```sh
    cp apps/shelve/.env.example apps/shelve/.env
    ```

2. Update the environment variables in the `.env` file.

### Main Controls
- Start the development server:
    ```sh
    bun dev
    ```

### First Use Guide
1. Open your browser and navigate to `http://localhost:3000`.
2. Follow the on-screen instructions to set up your first project and team.

## Development Setup

### Monorepo Structure
Shelve uses a monorepo structure to manage multiple packages and applications.

### Environment Setup
Ensure you have the necessary environment variables set up in the `.env` file.

### Necessary Environment Variables
- DATABASE_URL
- NUXT_PRIVATE_REDIS_URL
- NUXT_PRIVATE_ENCRYPTION_KEY
- NUXT_SESSION_PASSWORD

### Development Commands
- Start the development server:
    ```sh
    bun dev
    ```

- Build the project:
    ```sh
    bun build
    ```

- Run tests:
    ```sh
    bun test
    ```

### Testing and Linting
- Run tests:
    ```sh
    bun test
    ```

- Run linting:
    ```sh
    bun lint
    ```

## Contributing Section

### How to Contribute
1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Make your changes and commit them with a descriptive message.
4. Push your changes to your fork.
5. Create a pull request to the main repository.

### Style Guide
- Follow the existing code style and conventions.
- Use descriptive commit messages.

### PR Workflow
1. Ensure your changes pass all tests and linting.
2. Create a pull request with a detailed description of your changes.
3. Wait for a review and address any feedback.

### Links to CONTRIBUTING.md
For more detailed guidelines, refer to the [CONTRIBUTING.md](CONTRIBUTING.md) file.

## Documentation Links

### Link to Full Documentation
For comprehensive documentation, visit the [Shelve Documentation](https://shelve.cloud/docs).

### Important Guides
- [Getting Started Guide](https://shelve.cloud/docs/getting-started)
- [API Reference](https://shelve.cloud/docs/api)
- [Examples of Use](https://shelve.cloud/docs/examples)

## Community & Support

### Community Links
- [GitHub Issues](https://github.com/HugoRCD/shelve/issues)
- [Discord Community](https://discord.gg/shelve)

### Where to Ask Questions
For questions and support, join our [Discord Community](https://discord.gg/shelve) or open an issue on GitHub.

### How to Report Bugs
To report bugs, open an issue on the [GitHub Issues](https://github.com/HugoRCD/shelve/issues) page.

### How to Suggest Features
To suggest new features, open an issue on the [GitHub Issues](https://github.com/HugoRCD/shelve/issues) page.

## License & Credits

### Project License
Shelve is licensed under the [Apache License 2.0](LICENSE).

### Acknowledgements
We would like to thank all contributors and the open-source community for their support.

### Main Contributors
- [Hugo Richard](https://github.com/HugoRCD)
- [Johann Cavallucci](https://github.com/CavallucciJohann)

## Self-Hosting with Docker

To self-host the Shelve application using the Docker image available on GitHub, follow these steps:

1. **Pull the Docker Image**:
    ```sh
    docker pull ghcr.io/hugorcd/shelve:latest
    ```

2. **Run the Docker Container**:
    ```sh
    docker run -d -p 8080:80 --name shelve-app ghcr.io/hugorcd/shelve:latest
    ```

3. **Access the Application**:
   Open your browser and navigate to `http://localhost:8080` to access the Shelve application.

Ensure you have Docker installed and running on your machine before executing these commands. For more information on Docker, refer to the [official Docker documentation](https://docs.docker.com/get-docker/).

## Self-Hosting with docker-compose

To self-host the Shelve application using the community `docker-compose` configuration, follow these steps:

1. **Clone the Repository**:
    ```sh
    git clone https://github.com/HugoRCD/shelve.git
    cd shelve
    ```

2. **Copy the Example Environment File**:
    ```sh
    cp apps/shelve/.env.example apps/shelve/.env
    ```

3. **Update Environment Variables**:
   Edit the `apps/shelve/.env` file and update the necessary environment variables.

4. **Run docker-compose**:
    ```sh
    docker-compose -f docker-compose.community.yml up -d
    ```

5. **Access the Application**:
   Open your browser and navigate to `http://localhost:3000` to access the Shelve application.

Ensure you have Docker and docker-compose installed and running on your machine before executing these commands. For more information on Docker and docker-compose, refer to the official Docker documentation.

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

_🤖 auto updated with [automd](https://automd.unjs.io) (last updated: Wed Nov 20 2024)_

<!-- /automd -->
