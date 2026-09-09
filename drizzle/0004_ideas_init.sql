CREATE TABLE "ideas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"avatar" text DEFAULT '' NOT NULL,
	"who" text DEFAULT '' NOT NULL,
	"posted_at" text DEFAULT '' NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"reactions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"comments" jsonb DEFAULT '[]'::jsonb NOT NULL
);
