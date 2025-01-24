---
title: Environments
description: Learn more about environments in Shelve
---

![environments](/docs/environments.png)

Environments are a way to group variables by context. You can create environments for different stages of your application like development, staging, production for example. Each environment can have its own set of variables, which allows you to manage your configurations more efficiently.

You can create as many environments as you want. To create an environment, click on the `New Environment` button, give it a name (e.g., `preview`, `feat/218`, `staging`, `production`), and click on the `Create` button. The name must be unique across all environments. Creating an environment will automatically add a field to set a variable value for this environment.

::caution
You can delete an environment but be careful, this action is irreversible and will delete all variables associated with this environment.
::
