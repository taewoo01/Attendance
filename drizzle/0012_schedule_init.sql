CREATE TABLE "fixed_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"day_of_week" text DEFAULT '' NOT NULL,
	"time_range" text DEFAULT '' NOT NULL,
	"title" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "personal_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"event_date" date NOT NULL,
	"event_time" text DEFAULT '' NOT NULL,
	"title" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "fixed_schedules" ADD CONSTRAINT "fixed_schedules_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_events" ADD CONSTRAINT "personal_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;