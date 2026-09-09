CREATE TABLE "achievement_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"achievement_id" uuid NOT NULL,
	"user_id" uuid,
	"storage_path" text NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"size_bytes" integer DEFAULT 0 NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "team_members" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "link" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "achievement_files" ADD CONSTRAINT "achievement_files_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "achievement_files" ADD CONSTRAINT "achievement_files_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;