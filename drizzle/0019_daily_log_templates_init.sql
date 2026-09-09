CREATE TABLE "daily_log_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"items" text[] DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daily_log_templates" ADD CONSTRAINT "daily_log_templates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;