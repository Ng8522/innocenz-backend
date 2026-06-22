DROP TABLE "main"."admin_role" CASCADE;--> statement-breakpoint
ALTER TABLE "main"."m_pr" ADD COLUMN "profile_image" varchar;--> statement-breakpoint
ALTER TABLE "main"."role" ADD COLUMN "is_parent_form" varchar;