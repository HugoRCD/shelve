ALTER TABLE "projects" ALTER COLUMN "repository" SET DATA TYPE varchar(200);--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "repository" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "projectManager" SET DATA TYPE varchar(200);--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "projectManager" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "homepage" SET DATA TYPE varchar(200);--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "homepage" SET DEFAULT '';