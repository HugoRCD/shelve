CREATE TYPE "public"."auth_types" AS ENUM('github', 'google');--> statement-breakpoint
CREATE TYPE "public"."roles" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."team_role" AS ENUM('owner', 'admin', 'member');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "environments" (
	"id" bigint PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "environments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" varchar(25) NOT NULL,
	"teamId" bigint NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "members" (
	"id" bigint PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "members_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"userId" bigint NOT NULL,
	"teamId" bigint NOT NULL,
	"role" "team_role" DEFAULT 'member' NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects" (
	"id" bigint PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "projects_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" varchar(50) NOT NULL,
	"teamId" bigint NOT NULL,
	"description" varchar(500) DEFAULT '' NOT NULL,
	"repository" varchar(50) DEFAULT '' NOT NULL,
	"projectManager" varchar(100) DEFAULT '' NOT NULL,
	"homepage" varchar(100) DEFAULT '' NOT NULL,
	"variablePrefix" varchar(500) DEFAULT '' NOT NULL,
	"logo" varchar(500) DEFAULT 'https://github.com/HugoRCD/shelve/blob/main/assets/default.webp?raw=true' NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teams" (
	"id" bigint PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "teams_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" varchar(50) NOT NULL,
	"slug" varchar(50) NOT NULL,
	"logo" varchar(500) DEFAULT 'https://github.com/HugoRCD/shelve/blob/main/assets/default.webp?raw=true' NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "teams_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tokens" (
	"id" bigint PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "tokens_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"token" varchar(50) NOT NULL,
	"name" varchar(25) NOT NULL,
	"userId" bigint NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" bigint PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"username" varchar(25) NOT NULL,
	"email" varchar(50) NOT NULL,
	"avatar" varchar(500) DEFAULT 'https://i.imgur.com/6VBx3io.png' NOT NULL,
	"role" "roles" DEFAULT 'user' NOT NULL,
	"authType" "auth_types" NOT NULL,
	"onboarding" boolean DEFAULT false NOT NULL,
	"cliInstalled" boolean DEFAULT false NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "variable_values" (
	"id" bigint PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "variable_values_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"variableId" bigint NOT NULL,
	"environmentId" bigint NOT NULL,
	"value" varchar(255) NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "variables" (
	"id" bigint PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "variables_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"projectId" bigint NOT NULL,
	"key" varchar(50) NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "environments" ADD CONSTRAINT "environments_teamId_teams_id_fk" FOREIGN KEY ("teamId") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "members" ADD CONSTRAINT "members_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "members" ADD CONSTRAINT "members_teamId_teams_id_fk" FOREIGN KEY ("teamId") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects" ADD CONSTRAINT "projects_teamId_teams_id_fk" FOREIGN KEY ("teamId") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tokens" ADD CONSTRAINT "tokens_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "variable_values" ADD CONSTRAINT "variable_values_variableId_variables_id_fk" FOREIGN KEY ("variableId") REFERENCES "public"."variables"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "variable_values" ADD CONSTRAINT "variable_values_environmentId_environments_id_fk" FOREIGN KEY ("environmentId") REFERENCES "public"."environments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "variables" ADD CONSTRAINT "variables_projectId_projects_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "environments_team_name_idx" ON "environments" USING btree ("teamId","name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "environments_team_idx" ON "environments" USING btree ("teamId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "members_user_team_idx" ON "members" USING btree ("userId","teamId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "members_role_idx" ON "members" USING btree ("role");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "members_team_role_idx" ON "members" USING btree ("teamId","role");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "projects_team_name_idx" ON "projects" USING btree ("teamId","name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "projects_team_idx" ON "projects" USING btree ("teamId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "tokens_token_idx" ON "tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tokens_user_idx" ON "tokens" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "variable_values_variable_env_idx" ON "variable_values" USING btree ("variableId","environmentId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "variable_values_env_idx" ON "variable_values" USING btree ("environmentId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "variables_project_key_idx" ON "variables" USING btree ("projectId","key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "variables_key_idx" ON "variables" USING btree ("key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "variables_project_idx" ON "variables" USING btree ("projectId");