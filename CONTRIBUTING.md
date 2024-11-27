# Contributing to Shelve

Thank you for your interest in contributing to Shelve! We welcome contributions from the community and are excited to work with you. Please follow the guidelines below to ensure a smooth and effective contribution process.

## Contribution Guidelines

### Reporting Issues

If you encounter any issues or bugs while using Shelve, please report them by opening an issue on our [GitHub Issues](https://github.com/HugoRCD/shelve/issues) page. Provide as much detail as possible, including steps to reproduce the issue, screenshots, and any relevant error messages.

### Suggesting Features

We welcome feature suggestions and ideas to improve Shelve. To suggest a new feature, please open an issue on our [GitHub Issues](https://github.com/HugoRCD/shelve/issues) page and provide a clear description of the feature, its benefits, and any potential use cases.

### Development Setup

To set up the development environment for Shelve, follow these steps:

1. **Clone the Repository**:
    ```sh
    git clone https://github.com/HugoRCD/shelve.git
    cd shelve
    ```

2. **Install Dependencies**:
    ```sh
    bun install
    ```

3. **Copy the Example Environment File**:
    ```sh
    cp apps/shelve/.env.example apps/shelve/.env
    ```

4. **Update Environment Variables**:
   Edit the `apps/shelve/.env` file and update the necessary environment variables.

5. **Start the Development Server**:
    ```sh
    bun dev
    ```

### PR Process

1. **Fork the Repository**:
   Create a fork of the Shelve repository on GitHub.

2. **Create a Branch**:
   Create a new branch for your feature or bugfix. Use a descriptive name for the branch, such as `feat/add-new-feature` or `fix/issue-123`.

3. **Make Changes**:
   Make your changes in the new branch. Ensure that your code follows the project's coding standards and conventions.

4. **Commit Changes**:
   Commit your changes with a clear and descriptive commit message. Follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.

5. **Push Changes**:
   Push your changes to your forked repository.

6. **Create a Pull Request**:
   Create a pull request (PR) from your forked repository to the main Shelve repository. Provide a detailed description of your changes and any relevant information.

7. **Address Feedback**:
   Be responsive to feedback and comments on your PR. Make any necessary changes and update your PR accordingly.

### Code Style Guide

- Follow the existing code style and conventions.
- Use meaningful variable and function names.
- Write clear and concise comments where necessary.
- Ensure your code is well-documented.

### Testing Requirements

- Write tests for any new features or bug fixes.
- Ensure that all tests pass before submitting your PR.
- Run the following command to execute the tests:
    ```sh
    bun test
    ```

### Additional Resources

- [Shelve Documentation](https://shelve.cloud/docs)
- [GitHub Repository](https://github.com/HugoRCD/shelve)
- [Discord Community](https://discord.gg/shelve)

Thank you for contributing to Shelve! We appreciate your support and look forward to your contributions.

