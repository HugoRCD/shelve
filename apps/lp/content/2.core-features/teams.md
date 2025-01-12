---
title: Teams
description: Learn more about teams in Shelve
---

![teams](/docs/teams.png)

Shelve is designed to be used by teams of developers but can also be used by solo developers. A team is a group of users who work together on a project. Teams can have multiple members, each with different roles that determine their permissions within the team.

### Roles

Shelve has three roles: **Owner**, **Admin**, and **Member**.

- **Owner**: The user who created the team. The owner has full control over the team, members and projects. He's the only one who can delete projects, variables, environments, and the team itself.
- **Admin**: Users with admin permissions can manage the team, members, and projects. They can't delete the team or change the owner.
- **Member**: Users with member permissions can only view the settings of the team and projects. They can't make any changes but can create and update variables.

### Workspaces

Team act as a container for projects and variables. Each team has its own workspace where you can create and manage projects and variables. Team workspaces are isolated from each other, meaning that projects and variables from one team are not accessible by another team.

### Slug

A team slug is a unique identifier for a team. It is used in URLs to access the team's workspace. The team slug is automatically generated when you create a team and can be customized later but must be unique across all teams.
This also the unique identifier that you can use to access the team's workspace via the CLI

```json [shelve.json]
{
  "slug": "nuxtlabs",
  "project": "@nuxt/ui"
}
```
