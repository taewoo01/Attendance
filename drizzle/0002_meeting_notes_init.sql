CREATE TABLE "meeting_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"meeting_date" text DEFAULT '' NOT NULL,
	"place" text DEFAULT '' NOT NULL,
	"attendees" text[] DEFAULT '{}' NOT NULL,
	"agenda" text[] DEFAULT '{}' NOT NULL,
	"decisions" text[] DEFAULT '{}' NOT NULL,
	"actions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"tag" text DEFAULT '' NOT NULL,
	"recorder" text DEFAULT '' NOT NULL
);
