ALTER TABLE "meeting_notes" ADD COLUMN "meeting_date_key" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "meeting_notes" ADD COLUMN "meeting_time" text DEFAULT '' NOT NULL;