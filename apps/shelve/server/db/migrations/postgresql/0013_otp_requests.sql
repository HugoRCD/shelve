CREATE TABLE "otp_requests" (
	"email" varchar(255) PRIMARY KEY NOT NULL,
	"count" integer NOT NULL,
	"windowStart" timestamp NOT NULL
);
