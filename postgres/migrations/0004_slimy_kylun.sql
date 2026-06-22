ALTER TABLE "main"."admin" ALTER COLUMN "password_hash" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "main"."admin" ALTER COLUMN "password_hash" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "main"."user" ALTER COLUMN "password_hash" DROP NOT NULL;