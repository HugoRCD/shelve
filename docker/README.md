## Self-Hosting with Coolify
The Coolify self-host option is the easiest way to get started with Shelve. Coolify is a platform that allows you to deploy applications with a single click. To self-host the Shelve application using Coolify, follow these steps:
1. Copy the Coolify [Docker Compose file](./docker-compose.coolify.yml)
2. Add a new resource in Coolify and select the `Docker Compose Empty` option.
3. Select your server and paste the contents of the `docker-compose.coolify.yml` file.
4. Then go to the `Environment Variables` tab and add the necessary environment variables.
5. The only required environment variable are the OAuth client ID and secret. You can get these by creating a new OAuth application on GitHub or Google. Other variable will be automatically set by Coolify [Magic Variables](https://coolify.io/docs/knowledge-base/docker/compose#coolifys-magic-environment-variables).
6. Click the `Deploy` button to start the deployment process.
7. Once the deployment is complete, you can access the application by clicking the `Link` button.
8. That's it! You have successfully self-hosted the Shelve application using Coolify.

Ensure you have a Coolify account and a server set up before following these steps. For more information on Coolify, refer to the [official Coolify documentation](https://coolify.io/docs/).

## Self-Hosting with Docker Compose

TODO

## Self-Hosting with Docker Image

TODO

