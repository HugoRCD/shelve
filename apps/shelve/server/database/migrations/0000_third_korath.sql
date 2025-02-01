CREATE TABLE `environments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`teamId` integer NOT NULL,
	`updatedAt` text NOT NULL,
	`createdAt` text NOT NULL,
	FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `github_app` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`appId` integer NOT NULL,
	`privateKey` text NOT NULL,
	`webhookSecret` text NOT NULL,
	`clientId` text NOT NULL,
	`clientSecret` text NOT NULL,
	`userId` integer NOT NULL,
	`updatedAt` text NOT NULL,
	`createdAt` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `github_app_slug_unique` ON `github_app` (`slug`);--> statement-breakpoint
CREATE TABLE `members` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`teamId` integer NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`updatedAt` text NOT NULL,
	`createdAt` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`teamId` integer NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`repository` text DEFAULT '' NOT NULL,
	`projectManager` text DEFAULT '' NOT NULL,
	`homepage` text DEFAULT '' NOT NULL,
	`variablePrefix` text DEFAULT '' NOT NULL,
	`logo` text DEFAULT 'https://github.com/HugoRCD/shelve/blob/main/assets/default.webp?raw=true' NOT NULL,
	`updatedAt` text NOT NULL,
	`createdAt` text NOT NULL,
	FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `team_stats` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`teamId` integer NOT NULL,
	`pushCount` integer DEFAULT 0 NOT NULL,
	`pullCount` integer DEFAULT 0 NOT NULL,
	`updatedAt` text NOT NULL,
	`createdAt` text NOT NULL,
	FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `team_stats_teamId_unique` ON `team_stats` (`teamId`);--> statement-breakpoint
CREATE TABLE `teams` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`logo` text DEFAULT 'https://github.com/HugoRCD/shelve/blob/main/assets/default.webp?raw=true' NOT NULL,
	`updatedAt` text NOT NULL,
	`createdAt` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `teams_slug_unique` ON `teams` (`slug`);--> statement-breakpoint
CREATE TABLE `tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`token` text NOT NULL,
	`name` text NOT NULL,
	`userId` integer NOT NULL,
	`updatedAt` text NOT NULL,
	`createdAt` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tokens_token_unique` ON `tokens` (`token`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`avatar` text DEFAULT 'https://i.imgur.com/6VBx3io.png' NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`authType` text NOT NULL,
	`onboarding` integer DEFAULT false NOT NULL,
	`cliInstalled` integer DEFAULT false NOT NULL,
	`updatedAt` text NOT NULL,
	`createdAt` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `variable_values` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`variableId` integer NOT NULL,
	`environmentId` integer NOT NULL,
	`value` text NOT NULL,
	`updatedAt` text NOT NULL,
	`createdAt` text NOT NULL,
	FOREIGN KEY (`variableId`) REFERENCES `variables`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`environmentId`) REFERENCES `environments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `variables` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`projectId` integer NOT NULL,
	`key` text NOT NULL,
	`updatedAt` text NOT NULL,
	`createdAt` text NOT NULL,
	FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
