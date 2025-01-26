---
title: Variables
description: Learn more about variables in Shelve
---

Variables are key-value pairs that store environment configurations and secrets. You can create variables for different environments like development, staging, production or even custom environments. Understanding how to effectively manage these variables is crucial for maintaining a secure and efficient development workflow.

## Creating Variables

### Variables Form

The variables form is an incredibly powerful tool that allows you to create variables for multiple environments at the same time. You can easily import variables from a file or export them by clicking on the three dots in the top right corner. Plus, you can simply drag and drop a `.env` file (or any other supported files containing variables) or copy/paste to import variables, which will be automatically parsed and cleaned by removing comments, empty lines, and quotes.

Working with variable names is made easier through several thoughtful features. As you type, the form automatically converts your keys to uppercase, following the common convention for environment variables. You'll also find a prefix button that helps you maintain consistency with framework-specific prefixes like `NUXT_PRIVATE_` or `REACT_APP_`. For generating secure values, especially useful for passwords or tokens, the Value Generator button provides random strings that meet your security requirements.

### Variable Item

![variable-item](/docs/variable-item.png)

Each variable in Shelve is designed to provide clear visibility and easy access to its information. When looking at a variable, you'll see its key, value, and environment status all clearly displayed. Values are masked by default to protect sensitive information, but you can easily reveal them using the `eye` icon when needed.

The copy functionality goes beyond simple value copying. While you can copy individual fields, you can also copy the entire variable string in the format `KEY=value` by clicking on the environment name. This becomes particularly useful when you need to quickly share or transfer variables between projects.

One of the most valuable features is the environment indicator system. These indicators provide an immediate visual understanding of where each variable is set. When managing large projects with multiple environments, this becomes invaluable for ensuring consistency and identifying potential missing configurations.

## Variables Selector

<video width="100%" autoplay loop muted>
  <source src="/docs/variable-selector.mp4" type="video/mp4" autoplay>
</video>

You can easily select multiple variables by clicking on each item. Once selected, you can perform bulk actions like copying, deleting, or sending them to Github Secrets if you've connected your project to a repository and install a [Github App](/integrations/github) to synchronize your secrets with Github Secrets.
