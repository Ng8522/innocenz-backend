CREATE SCHEMA IF NOT EXISTS "main";

CREATE TABLE IF NOT EXISTS "main"."test" (
  "testId" varchar PRIMARY KEY NOT NULL,
  "status" varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS "main"."users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" varchar(100) NOT NULL,
  "display_name" varchar(100) NOT NULL,
  "password_hash" varchar(255) NOT NULL,
  "contact_no" varchar(20),
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "users_email_unique" UNIQUE("email")
);

INSERT INTO "main"."test" ("testId", "status") VALUES ('health-check', 'ok')
ON CONFLICT DO NOTHING;
